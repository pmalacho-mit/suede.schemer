// The sound, as numbers: what each part of the Web Audio graph is set to for
// a patch. engine.ts turns these into nodes; everything here is pure.
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import { frequency } from "./notes.ts";
import type { Filter, Oscillator, Patch, Wave } from "./patch.ts";

/** Each oscillator's share of full scale, so three at full level stay under it. */
export const HEADROOM = 0.25;

export type OscillatorSettings = {
  type: Wave;
  frequency: number;
  detune: number;
  gain: number;
};

/** An oscillator's settings for a note: its octave sets the frequency, its detune the cents, its level the gain. */
export const oscillatorSettings = (
  { wave, octave, detune, level }: Oscillator,
  midi: number,
): OscillatorSettings => ({
  type: wave,
  frequency: frequency(midi + 12 * octave),
  detune,
  gain: level * HEADROOM,
});

declare namespace oscillatorSettings {
  /** A4, an octave down, a little flat, at half level */
  export type OctaveDown = Expect<
    Invoke<
      typeof oscillatorSettings,
      [
        oscillator: { wave: "square"; octave: -1; detune: -7; level: 0.5 },
        midi: 69,
      ]
    >,
    "=",
    { type: "square"; frequency: 220; detune: -7; gain: 0.125 }
  >;
}

/** A soft-clipping curve for a WaveShaper: `drive` 0 is a straight line, 1 nearly a square. */
export const distortionCurve = (drive: number, length = 1024): number[] => {
  const k = drive * 100;
  return Array.from({ length }, (_, i) => {
    const x = (i * 2) / (length - 1) - 1;
    return ((1 + k) * x) / (1 + k * Math.abs(x));
  });
};

declare namespace distortionCurve {
  /** no drive: the identity */
  export type Clean = Expect<
    Invoke<typeof distortionCurve, [drive: 0, length: 5]>,
    "=",
    [-1, -0.5, 0, 0.5, 1]
  >;

  /** full drive: quiet input is pushed almost to full scale, the ends stay put */
  export type Driven = [
    Expect<Invoke<typeof distortionCurve, [drive: 1, length: 3]>, "=", [-1, 0, 1]>,
    Expect<
      Invoke<typeof distortionCurve, [drive: 1, length: 5]>[3],
      ["~=", 1e-9],
      0.9901960784313726
    >,
  ];
}

/** How much quieter a driven signal is made, so turning up the drive does not just turn it up. */
export const driveMakeup = (drive: number): number => 1 / (1 + drive * 1.5);

/** A tremolo's gain: it swings by `depth` below full, around `base`. */
export const tremoloGains = (depth: number) => ({
  base: 1 - depth / 2,
  swing: depth / 2,
});

declare namespace tremoloGains {
  export type Cases = Table<
    typeof tremoloGains,
    [
      [args: [depth: 0], expected: { base: 1; swing: 0 }],
      [args: [depth: 1], expected: { base: 0.5; swing: 0.5 }],
    ]
  >;
}

/**
 * What decides the shape of the graph after the voices: the filter's type
 * and the effects in order. While it stays the same, a change of patch only
 * moves parameters; when it changes, the chain is rebuilt.
 */
export const structureOf = ({
  filter,
  effects,
}: Pick<Patch, "filter" | "effects">): string =>
  [filter.type, ...effects.map((e) => e.type)].join(" → ");

declare namespace structureOf {
  export type Chain = Expect<
    Invoke<
      typeof structureOf,
      [
        patch: {
          filter: { type: "lowpass"; cutoff: 900; resonance: 1 };
          effects: [
            { type: "distortion"; drive: 0.3 },
            { type: "delay"; time: 0.3; feedback: 0.2; mix: 0.3 },
          ];
        },
      ]
    >,
    "=",
    "lowpass → distortion → delay"
  >;

  /** the numbers do not matter */
  export type OnlyTypes = Expect<
    Invoke<
      typeof structureOf,
      [patch: { filter: { type: "off" }; effects: [{ type: "tremolo"; rate: 9; depth: 0.1 }] }]
    >,
    "=",
    "off → tremolo"
  >;
}

/**
 * How much the filter lets through at `frequency`, in decibels: the
 * magnitude of the biquad Web Audio builds for it (the Audio EQ Cookbook's,
 * with the resonance in decibels, as a BiquadFilterNode's Q is for these
 * types). At the cutoff it is the resonance itself.
 */
export const filterGain = (
  filter: Filter,
  frequency: number,
  sampleRate = 48000,
): number => {
  if (filter.type === "off") return 0;
  const w0 = (2 * Math.PI * filter.cutoff) / sampleRate;
  const alpha = Math.sin(w0) / (2 * Math.pow(10, filter.resonance / 20));
  const cos = Math.cos(w0);
  const low = filter.type === "lowpass";
  const b0 = low ? (1 - cos) / 2 : (1 + cos) / 2;
  const b1 = low ? 1 - cos : -(1 + cos);
  const [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
  // H(e^jw) = (b0 + b1 e^-jw + b0 e^-2jw) / (a0 + a1 e^-jw + a2 e^-2jw)
  const w = (2 * Math.PI * frequency) / sampleRate;
  const [c1, s1, c2, s2] = [
    Math.cos(w),
    Math.sin(w),
    Math.cos(2 * w),
    Math.sin(2 * w),
  ];
  const nr = b0 + b1 * c1 + b0 * c2;
  const ni = -(b1 * s1 + b0 * s2);
  const dr = a0 + a1 * c1 + a2 * c2;
  const di = -(a1 * s1 + a2 * s2);
  return 10 * Math.log10((nr * nr + ni * ni) / (dr * dr + di * di));
};

declare namespace filterGain {
  type LowPass = { type: "lowpass"; cutoff: 1000; resonance: 6 };
  type HighPass = { type: "highpass"; cutoff: 1000; resonance: 0 };

  export type Cases = Table<
    typeof filterGain,
    [
      [args: [filter: { type: "off" }, frequency: 440], expected: 0],
      // at the cutoff, the resonance
      [
        args: [filter: LowPass, frequency: 1000],
        condition: ["~=", 1e-9],
        expected: 6,
      ],
      [
        args: [filter: HighPass, frequency: 1000],
        condition: ["~=", 1e-9],
        expected: 0,
      ],
      // far below a low-pass's cutoff, untouched
      [
        args: [filter: LowPass, frequency: 20],
        condition: ["~=", 0.01],
        expected: 0,
      ],
    ]
  >;

  /** two octaves above a low-pass's cutoff, cut by about 12 dB an octave */
  export type Slope = Expect<
    Invoke<
      typeof filterGain,
      [filter: { type: "lowpass"; cutoff: 1000; resonance: 0 }, frequency: 4000]
    >,
    "<",
    -20
  >;

  /** a high-pass cuts the lows */
  export type CutsLows = Expect<
    Invoke<typeof filterGain, [filter: HighPass, frequency: 100]>,
    "<",
    -35
  >;
}
