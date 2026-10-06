// The Web Audio graph a patch describes. Nothing is created until `start()`,
// which the instrument calls on the first key pressed (browsers only let a
// page make sound after a gesture). Where there is no Web Audio at all
// (jsdom, under test) `start()` says so and every other call does nothing.
//
//   voice ─┐
//   voice ─┼─▶ bus ─▶ [filter] ─▶ [effect] ─▶ … ─▶ master ─▶ limiter ─▶ out
//   voice ─┘
//
// A voice is one held note: an oscillator (with its own gain) per oscillator
// of the patch, into an envelope gain. Editing the patch moves parameters in
// place, on held notes too; a change of the chain's shape (a filter turned on,
// an effect added) rebuilds the part after the bus, so held notes keep ringing.
import type { Effect, Patch } from "./patch.ts";
import {
  distortionCurve,
  driveMakeup,
  oscillatorSettings,
  structureOf,
  tremoloGains,
} from "./sound.ts";

/** How quickly a moved parameter glides to its new value, in seconds (a time constant). */
const GLIDE = 0.012;

type Stage = {
  input: AudioNode;
  output: AudioNode;
  update(effect: Effect): void;
  dispose(): void;
};

type Tone = { osc: OscillatorNode; gain: GainNode };

type Voice = {
  midi: number;
  envelope: GainNode;
  partials: Tone[];
  started: number;
  released: boolean;
};

const glide = (param: AudioParam, value: number, at: number) =>
  param.setTargetAtTime(value, at, GLIDE);

export class Engine {
  #context?: AudioContext;
  #patch: Patch;
  #voices = new Map<number, Voice>();
  #bus?: GainNode;
  #master?: GainNode;
  #filter?: BiquadFilterNode;
  #stages: Stage[] = [];
  #structure = "";

  constructor(patch: Patch) {
    this.#patch = patch;
  }

  /** Whether this browser can make sound at all. */
  static get supported() {
    return typeof globalThis.AudioContext === "function";
  }

  /** Whether sound is running. */
  get running() {
    return this.#context?.state === "running";
  }

  /** Creates the graph on first call (from a gesture), resumes it after; false where there is no Web Audio. */
  start(): boolean {
    if (!Engine.supported) return false;
    if (!this.#context) {
      const context = new AudioContext({ latencyHint: "interactive" });
      this.#context = context;
      this.#bus = new GainNode(context, { gain: 1 });
      this.#master = new GainNode(context, { gain: this.#patch.volume });
      const limiter = new DynamicsCompressorNode(context, {
        threshold: -8,
        knee: 6,
        ratio: 12,
        attack: 0.003,
        release: 0.2,
      });
      this.#master.connect(limiter).connect(context.destination);
      this.#rebuild();
    }
    if (this.#context.state === "suspended") void this.#context.resume();
    return true;
  }

  /** Takes a new patch: moves what it can in place, rebuilds the chain when its shape changed. */
  update(patch: Patch) {
    this.#patch = patch;
    const context = this.#context;
    if (!context) return;
    const now = context.currentTime;
    glide(this.#master!.gain, patch.volume, now);
    if (structureOf(patch) !== this.#structure) this.#rebuild();
    else {
      const { filter } = patch;
      if (this.#filter && filter.type !== "off") {
        glide(this.#filter.frequency, filter.cutoff, now);
        glide(this.#filter.Q, filter.resonance, now);
      }
      this.#stages.forEach((stage, i) => stage.update(patch.effects[i]));
    }
    const { attack, decay, sustain } = patch.envelope;
    for (const voice of this.#voices.values()) {
      if (voice.released) continue;
      this.#retune(voice, now);
      // a held note already at its sustain follows the sustain level
      if (now > voice.started + attack + decay)
        glide(voice.envelope.gain, sustain, now);
    }
  }

  /** Starts a note (a MIDI number), its envelope rising through attack and decay to sustain. */
  noteOn(midi: number) {
    const context = this.#context;
    if (!context) return;
    const held = this.#voices.get(midi);
    if (held) this.#release(held, 0.01);

    const now = context.currentTime;
    const { attack, decay, sustain } = this.#patch.envelope;
    const envelope = new GainNode(context, { gain: 0 });
    envelope.connect(this.#bus!);
    const voice: Voice = {
      midi,
      envelope,
      partials: [],
      started: now,
      released: false,
    };
    this.#retune(voice, now);

    const level = envelope.gain;
    level.setValueAtTime(0, now);
    level.linearRampToValueAtTime(1, now + attack);
    level.linearRampToValueAtTime(sustain, now + attack + decay);
    this.#voices.set(midi, voice);
  }

  /** Lets a note go: its envelope falls to silence over the release, then its nodes are let go. */
  noteOff(midi: number) {
    const voice = this.#voices.get(midi);
    if (voice) this.#release(voice, this.#patch.envelope.release);
  }

  /** Lets every note go. */
  allOff() {
    for (const voice of [...this.#voices.values()]) this.#release(voice, 0.05);
  }

  /** Stops everything and closes the context. */
  dispose() {
    this.allOff();
    void this.#context?.close();
    this.#context = undefined;
  }

  #release(voice: Voice, release: number) {
    const context = this.#context;
    if (!context || voice.released) return;
    voice.released = true;
    if (this.#voices.get(voice.midi) === voice) this.#voices.delete(voice.midi);
    const now = context.currentTime;
    const level = voice.envelope.gain;
    // hold wherever the envelope is now, then fall from there
    if (typeof level.cancelAndHoldAtTime === "function")
      level.cancelAndHoldAtTime(now);
    else {
      level.cancelScheduledValues(now);
      level.setValueAtTime(level.value, now);
    }
    level.linearRampToValueAtTime(0, now + release);
    const end = now + release + 0.05;
    voice.partials.forEach(({ osc }) => osc.stop(end));
    voice.partials[0]?.osc.addEventListener("ended", () =>
      voice.envelope.disconnect(),
    );
    if (!voice.partials.length) voice.envelope.disconnect();
  }

  /** Brings a voice's oscillators in line with the patch: as many as it has, each with its wave, pitch and level. */
  #retune(voice: Voice, now: number) {
    const context = this.#context!;
    const wanted = this.#patch.oscillators.map((o) =>
      oscillatorSettings(o, voice.midi),
    );
    wanted.forEach((settings, i) => {
      const existing = voice.partials[i];
      if (existing) {
        if (existing.osc.type !== settings.type)
          existing.osc.type = settings.type;
        glide(existing.osc.frequency, settings.frequency, now);
        glide(existing.osc.detune, settings.detune, now);
        glide(existing.gain.gain, settings.gain, now);
        return;
      }
      const osc = new OscillatorNode(context, {
        type: settings.type,
        frequency: settings.frequency,
        detune: settings.detune,
      });
      const gain = new GainNode(context, { gain: settings.gain });
      osc.connect(gain).connect(voice.envelope);
      osc.start(now);
      voice.partials.push({ osc, gain });
    });
    // an oscillator taken out of the patch fades out of the held note
    for (const { osc, gain } of voice.partials.splice(wanted.length)) {
      glide(gain.gain, 0, now);
      osc.stop(now + 0.1);
    }
  }

  /** Rebuilds what comes after the bus: the filter, then each effect, into the master. */
  #rebuild() {
    const context = this.#context!;
    const patch = this.#patch;
    this.#bus!.disconnect();
    this.#filter?.disconnect();
    this.#stages.forEach((stage) => stage.dispose());

    let tail: AudioNode = this.#bus!;
    const { filter } = patch;
    this.#filter =
      filter.type === "off"
        ? undefined
        : new BiquadFilterNode(context, {
            type: filter.type,
            frequency: filter.cutoff,
            Q: filter.resonance,
          });
    if (this.#filter) tail = tail.connect(this.#filter);

    this.#stages = patch.effects.map((effect) => stage(context, effect));
    for (const s of this.#stages) {
      tail.connect(s.input);
      tail = s.output;
    }
    tail.connect(this.#master!);
    this.#structure = structureOf(patch);
  }
}

/** An effect's nodes, wired up, with a way to move its parameters and to take it apart. */
const stage = (context: AudioContext, effect: Effect): Stage => {
  switch (effect.type) {
    case "delay": {
      //   input ─┬────────────── dry ──┬─▶ output
      //          └─▶ delay ─▶ wet ─────┘
      //                ▲  │
      //                └─ feedback
      const input = new GainNode(context);
      const output = new GainNode(context);
      const delay = new DelayNode(context, {
        maxDelayTime: 2,
        delayTime: effect.time,
      });
      const feedback = new GainNode(context, { gain: effect.feedback });
      const wet = new GainNode(context, { gain: effect.mix });
      input.connect(output);
      input.connect(delay).connect(wet).connect(output);
      delay.connect(feedback).connect(delay);
      return {
        input,
        output,
        update(e) {
          if (e.type !== "delay") return;
          const now = context.currentTime;
          glide(delay.delayTime, e.time, now);
          glide(feedback.gain, e.feedback, now);
          glide(wet.gain, e.mix, now);
        },
        dispose() {
          [input, output, delay, feedback, wet].forEach((n) => n.disconnect());
        },
      };
    }
    case "distortion": {
      const shaper = new WaveShaperNode(context, {
        curve: new Float32Array(distortionCurve(effect.drive)),
        oversample: "4x",
      });
      const makeup = new GainNode(context, { gain: driveMakeup(effect.drive) });
      shaper.connect(makeup);
      let drive = effect.drive;
      return {
        input: shaper,
        output: makeup,
        update(e) {
          if (e.type !== "distortion" || e.drive === drive) return;
          drive = e.drive;
          shaper.curve = new Float32Array(distortionCurve(drive));
          glide(makeup.gain, driveMakeup(drive), context.currentTime);
        },
        dispose() {
          shaper.disconnect();
          makeup.disconnect();
        },
      };
    }
    case "tremolo": {
      // an LFO swings the gain around its base
      const { base, swing } = tremoloGains(effect.depth);
      const amp = new GainNode(context, { gain: base });
      const lfo = new OscillatorNode(context, {
        type: "sine",
        frequency: effect.rate,
      });
      const depth = new GainNode(context, { gain: swing });
      lfo.connect(depth).connect(amp.gain);
      lfo.start();
      return {
        input: amp,
        output: amp,
        update(e) {
          if (e.type !== "tremolo") return;
          const now = context.currentTime;
          const gains = tremoloGains(e.depth);
          glide(lfo.frequency, e.rate, now);
          glide(amp.gain, gains.base, now);
          glide(depth.gain, gains.swing, now);
        },
        dispose() {
          lfo.stop();
          [amp, lfo, depth].forEach((n) => n.disconnect());
        },
      };
    }
  }
};
