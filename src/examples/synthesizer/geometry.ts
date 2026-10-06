// The pure drawing behind the displays: the envelope's shape, the summed
// waveform of the oscillators, and the arc of a knob. All SVG path data.
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import type { Envelope, Filter, Oscillator, Wave } from "./patch.ts";
import { filterGain } from "./sound.ts";

export type Point = readonly [x: number, y: number];
export type Box = { width: number; height: number };

const round = (n: number) => Math.round(n * 100) / 100;

/** SVG path data through `points`: a move, then lines. */
export const pathOf = (points: readonly Point[]): string =>
  points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join(" ");

declare namespace pathOf {
  export type Lines = Expect<
    Invoke<typeof pathOf, [points: [[0, 10], [5.556, 0], [10, 10]]]>,
    "=",
    "M0 10 L5.56 0 L10 10"
  >;

  export type Empty = Expect<Invoke<typeof pathOf, [points: []]>, "=", "">;
}

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------

/** How long the drawing holds the sustain level, for a key held that long: a share of the rest, so it always shows. */
export const holdFor = ({ attack, decay, release }: Envelope) =>
  Math.max(0.35 * (attack + decay + release), 0.05);

declare namespace holdFor {
  export type Share = Expect<
    Invoke<
      typeof holdFor,
      [envelope: { attack: 1; decay: 2; sustain: 0.5; release: 3 }]
    >,
    ["~=", 1e-9],
    2.1
  >;

  export type Floor = Expect<
    Invoke<
      typeof holdFor,
      [envelope: { attack: 0.001; decay: 0.001; sustain: 1; release: 0.001 }]
    >,
    "=",
    0.05
  >;
}

/**
 * The envelope's five corners in `box`: silence, the attack's peak, the
 * sustain level after the decay, the end of a held key, and silence again
 * after the release. Time runs left to right, scaled so the whole shape fits;
 * level runs bottom (0) to top (1).
 */
export const envelopePoints = (
  envelope: Envelope,
  { width, height }: Box,
  hold: number = holdFor(envelope),
): Point[] => {
  const { attack, decay, sustain, release } = envelope;
  const total = attack + decay + hold + release;
  const x = (t: number) => (t / total) * width;
  const y = (level: number) => height - level * height;
  return [
    [0, y(0)],
    [x(attack), y(1)],
    [x(attack + decay), y(sustain)],
    [x(attack + decay + hold), y(sustain)],
    [width, y(0)],
  ];
};

declare namespace envelopePoints {
  /** equal times: the corners are evenly spaced */
  export type Even = Expect<
    Invoke<
      typeof envelopePoints,
      [
        envelope: { attack: 1; decay: 1; sustain: 0.5; release: 1 },
        box: { width: 100; height: 50 },
        hold: 1,
      ]
    >,
    "=",
    [[0, 50], [25, 0], [50, 25], [75, 25], [100, 50]]
  >;

  /** a longer attack takes more of the width, and pushes the peak right */
  export type LongAttack = Expect<
    Invoke<
      typeof envelopePoints,
      [
        envelope: { attack: 2; decay: 1; sustain: 0.5; release: 1 },
        box: { width: 100; height: 50 },
        hold: 1,
      ]
    >,
    "=",
    [[0, 50], [40, 0], [60, 25], [80, 25], [100, 50]]
  >;

  /** a sustain of zero falls to the floor and stays there */
  export type NoSustain = Expect<
    Invoke<
      typeof envelopePoints,
      [
        envelope: { attack: 1; decay: 1; sustain: 0; release: 2 },
        box: { width: 100; height: 10 },
        hold: 1,
      ]
    >,
    "=",
    [[0, 10], [20, 0], [40, 10], [60, 10], [100, 10]]
  >;
}

// ---------------------------------------------------------------------------
// Waveform
// ---------------------------------------------------------------------------

/** One wave's value at `phase` (in cycles), from -1 to 1, each starting at 0 and rising, as Web Audio's do. */
export const waveSample = (wave: Wave, phase: number): number => {
  const p = phase - Math.floor(phase);
  switch (wave) {
    case "sine":
      return Math.sin(2 * Math.PI * p);
    case "square":
      return p < 0.5 ? 1 : -1;
    case "sawtooth":
      return 2 * ((p + 0.5) % 1) - 1;
    case "triangle":
      return 4 * Math.abs(((p + 0.75) % 1) - 0.5) - 1;
  }
};

declare namespace waveSample {
  export type Cases = Table<
    typeof waveSample,
    [
      [args: [wave: "sine", phase: 0.25], expected: 1],
      [args: [wave: "square", phase: 0.1], expected: 1],
      [args: [wave: "square", phase: 0.6], expected: -1],
      [args: [wave: "sawtooth", phase: 0], expected: 0],
      [args: [wave: "sawtooth", phase: 0.25], expected: 0.5],
      [args: [wave: "sawtooth", phase: 0.75], expected: -0.5],
      [args: [wave: "triangle", phase: 0], expected: 0],
      [args: [wave: "triangle", phase: 0.25], expected: 1],
      [args: [wave: "triangle", phase: 0.75], expected: -1],
      [args: [wave: "triangle", phase: 1.25], expected: 1],
    ]
  >;
}

/**
 * `count` samples of the oscillators summed, over `cycles` cycles of the
 * lowest one, scaled so the loudest point reaches 1. Each oscillator runs at
 * its octave and detune relative to that lowest, weighted by its level.
 */
export const waveform = (
  oscillators: readonly Oscillator[],
  count: number,
  cycles = 2,
): number[] => {
  const audible = oscillators.filter((o) => o.level > 0);
  const lowest = Math.min(...audible.map((o) => o.octave));
  const sum = Array.from({ length: count }, (_, i) => {
    const phase = (i / count) * cycles;
    return audible.reduce(
      (total, { wave, octave, detune, level }) =>
        total +
        level *
          waveSample(
            wave,
            phase * Math.pow(2, octave - lowest + detune / 1200),
          ),
      0,
    );
  });
  const peak = Math.max(...sum.map(Math.abs), 0);
  return peak > 0 ? sum.map((s) => s / peak) : sum.map(() => 0);
};

declare namespace waveform {
  /** one square: +1 for half a cycle, then -1 */
  export type OneSquare = Expect<
    Invoke<
      typeof waveform,
      [
        oscillators: [{ wave: "square"; octave: 0; detune: 0; level: 0.5 }],
        count: 4,
        cycles: 1,
      ]
    >,
    "=",
    [1, 1, -1, -1]
  >;

  /** an octave above adds its own wiggle: square + square up an octave */
  export type TwoSquares = Expect<
    Invoke<
      typeof waveform,
      [
        oscillators: [
          { wave: "square"; octave: 0; detune: 0; level: 1 },
          { wave: "square"; octave: 1; detune: 0; level: 1 },
        ],
        count: 4,
        cycles: 1,
      ]
    >,
    "=",
    [1, 0, 0, -1]
  >;

  /** silent oscillators draw a flat line */
  export type Silent = Expect<
    Invoke<
      typeof waveform,
      [
        oscillators: [{ wave: "sine"; octave: 0; detune: 0; level: 0 }],
        count: 3,
      ]
    >,
    "=",
    [0, 0, 0]
  >;

  /** no oscillators at all, too */
  export type None = Expect<
    Invoke<typeof waveform, [oscillators: [], count: 2]>,
    "=",
    [0, 0]
  >;
}

/** Samples (-1 to 1) as points across `box`, +1 at the top; `inset` keeps the peaks off the edge. */
export const waveformPoints = (
  samples: readonly number[],
  { width, height }: Box,
  inset = 0,
): Point[] => {
  const middle = height / 2;
  const amplitude = middle - inset;
  const last = Math.max(samples.length - 1, 1);
  return samples.map((s, i) => [(i / last) * width, middle - s * amplitude]);
};

declare namespace waveformPoints {
  export type Spread = Expect<
    Invoke<
      typeof waveformPoints,
      [samples: [0, 1, 0, -1, 0], box: { width: 100; height: 20 }, inset: 2]
    >,
    "=",
    [[0, 10], [25, 2], [50, 10], [75, 18], [100, 10]]
  >;
}

// ---------------------------------------------------------------------------
// Knob
// ---------------------------------------------------------------------------

/** A knob turns through 270°, from 7:30 to 4:30, like most hardware. */
export const SWEEP = 270;

/** The point at `degrees` (0 is straight up, clockwise) on a circle. */
export const polar = (
  cx: number,
  cy: number,
  r: number,
  degrees: number,
): Point => {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return [round(cx + r * Math.cos(rad)), round(cy + r * Math.sin(rad))];
};

declare namespace polar {
  export type Cases = Table<
    typeof polar,
    [
      [args: [cx: 10, cy: 10, r: 5, degrees: 0], expected: [10, 5]],
      [args: [cx: 10, cy: 10, r: 5, degrees: 90], expected: [15, 10]],
      [args: [cx: 10, cy: 10, r: 5, degrees: 180], expected: [10, 15]],
    ]
  >;
}

/** SVG path data for a knob's arc, from its start to `position` (0 to 1) of its sweep. */
export const knobArc = (
  cx: number,
  cy: number,
  r: number,
  position: number,
): string => {
  const p = Math.min(1, Math.max(0, position));
  const from = -SWEEP / 2;
  const to = from + p * SWEEP;
  const [x0, y0] = polar(cx, cy, r, from);
  const [x1, y1] = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

declare namespace knobArc {
  /** halfway: up to 12 o'clock, the short way round */
  export type Half = Expect<
    Invoke<typeof knobArc, [cx: 10, cy: 10, r: 10, position: 0.5]>,
    "=",
    "M2.93 17.07 A10 10 0 0 1 10 0"
  >;

  /** all the way: past half a turn, so the large arc */
  export type Full = Expect<
    Invoke<typeof knobArc, [cx: 10, cy: 10, r: 10, position: 1]>,
    "=",
    "M2.93 17.07 A10 10 0 1 1 17.07 17.07"
  >;
}

// ---------------------------------------------------------------------------
// Wave icons
// ---------------------------------------------------------------------------

/** A wave's icon: one cycle across `box`, the sawtooth drawn from its trough so it reads as a ramp. */
export const glyphPoints = (wave: Wave, { width, height }: Box, count = 41) => {
  const offset = wave === "sawtooth" ? 0.5 : 0;
  return Array.from({ length: count }, (_, i): Point => {
    const t = i / (count - 1);
    return [t * width, height / 2 - (waveSample(wave, t + offset) * height) / 2];
  });
};

declare namespace glyphPoints {
  export type Square = Expect<
    Invoke<typeof glyphPoints, [wave: "square", box: { width: 10; height: 10 }, count: 3]>,
    "=",
    [[0, 0], [5, 10], [10, 0]]
  >;

  /** a ramp up from the bottom */
  export type Sawtooth = Expect<
    Invoke<typeof glyphPoints, [wave: "sawtooth", box: { width: 10; height: 10 }, count: 3]>,
    "=",
    [[0, 10], [5, 5], [10, 10]]
  >;
}

// ---------------------------------------------------------------------------
// Filter response
// ---------------------------------------------------------------------------

/** What the filter display spans: 20 Hz to 20 kHz across, +24 dB to −36 dB down. */
export const SPECTRUM = { low: 20, high: 20000, ceiling: 24, floor: -36 };

/** Where `frequency` falls across `width`, on a log scale. */
export const frequencyX = (frequency: number, width: number) =>
  (Math.log(frequency / SPECTRUM.low) / Math.log(SPECTRUM.high / SPECTRUM.low)) *
  width;

declare namespace frequencyX {
  export type Cases = Table<
    typeof frequencyX,
    [
      [args: [frequency: 20, width: 300], expected: 0],
      [args: [frequency: 2000, width: 300], condition: ["~=", 1e-9], expected: 200],
    ]
  >;
}

/** Where a level in decibels falls down `height`, clamped to the display. */
export const decibelY = (db: number, height: number) => {
  const { ceiling, floor } = SPECTRUM;
  const clamped = Math.max(floor, Math.min(ceiling, db));
  return ((ceiling - clamped) / (ceiling - floor)) * height;
};

/** The filter's response across `box`, at `count` frequencies spread evenly on a log scale. */
export const filterPoints = (filter: Filter, { width, height }: Box, count = 96) =>
  Array.from({ length: count }, (_, i): Point => {
    const t = i / (count - 1);
    const frequency = SPECTRUM.low * Math.pow(SPECTRUM.high / SPECTRUM.low, t);
    return [t * width, decibelY(filterGain(filter, frequency), height)];
  });

declare namespace filterPoints {
  /** off: a flat line at 0 dB, two fifths of the way down */
  export type Off = Expect<
    Invoke<typeof filterPoints, [filter: { type: "off" }, box: { width: 100; height: 60 }, count: 2]>,
    "=",
    [[0, 24], [100, 24]]
  >;

  /** a low-pass falls to the floor by 20 kHz */
  export type LowPass = Expect<
    Invoke<
      typeof filterPoints,
      [filter: { type: "lowpass"; cutoff: 500; resonance: 0 }, box: { width: 100; height: 60 }, count: 2]
    >[1],
    "=",
    [100, 60]
  >;
}
