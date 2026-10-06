// Plays one note of a patch through Web Audio: the wave and its harmonics,
// through the filter, shaped by the envelope.
import type { Patch } from "./data.ts";

let context: AudioContext | undefined;

/** Plays `patch` once, at `note` Hz shifted by its octave. */
export const play = (patch: Patch, note = 220) => {
  context ??= new AudioContext();
  const now = context.currentTime;
  const { attack, release } = patch.envelope;
  const end = now + attack + release;

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.linearRampToValueAtTime(patch.volume, now + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, end);

  let output: AudioNode = envelope;
  if (patch.filter.type !== "off") {
    const filter = context.createBiquadFilter();
    filter.type = patch.filter.type;
    filter.frequency.value = patch.filter.cutoff;
    output = envelope.connect(filter);
  }
  output.connect(context.destination);

  const tones = [{ ratio: 1, level: 1 }, ...patch.harmonics];
  for (const { ratio, level } of tones) {
    const oscillator = context.createOscillator();
    oscillator.type = patch.wave;
    oscillator.frequency.value = note * 2 ** patch.octave * ratio;
    const gain = context.createGain();
    gain.gain.value = level / tones.length;
    oscillator.connect(gain).connect(envelope);
    oscillator.start(now);
    oscillator.stop(end + 0.05);
  }
};
