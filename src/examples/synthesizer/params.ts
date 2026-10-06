// Every number in a patch, described once: its range and default (which the
// JSON Schema is built from), and how a control shows it (unit, scale, step,
// knob or fader). The renderers look a field up by its name, the last segment
// of its path, so `oscillators.2.level` and `oscillators.0.level` share one.
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";

export type Unit = "s" | "Hz" | "%" | "ct" | "oct" | "dB";

export type Param = {
  title: string;
  description?: string;
  min: number;
  max: number;
  default: number;
  unit: Unit;
  /** a log scale spreads a wide range (20 Hz to 20 kHz) evenly over the control */
  scale: "linear" | "log";
  /** the value's resolution, for a linear control */
  step: number;
  /** how it is drawn: a slider (a fader) or a knob */
  style: "fader" | "knob";
  integer?: boolean;
};

const param = (
  title: string,
  min: number,
  max: number,
  initial: number,
  unit: Unit,
  rest: Partial<Param> = {},
): Param => ({
  title,
  min,
  max,
  default: initial,
  unit,
  scale: "linear",
  step: 0.01,
  style: "fader",
  ...rest,
});

export const params = {
  octave: param("Octave", -2, 2, 0, "oct", {
    step: 1,
    integer: true,
    description: "Shifts the oscillator by whole octaves",
  }),
  detune: param("Detune", -50, 50, 0, "ct", {
    step: 1,
    description: "Fine tuning, in cents (a hundredth of a semitone)",
  }),
  level: param("Level", 0, 1, 0.6, "%", {
    description: "Its share of the mix",
  }),
  attack: param("Attack", 0.001, 4, 0.01, "s", {
    scale: "log",
    description: "Time to reach full level",
  }),
  decay: param("Decay", 0.001, 4, 0.3, "s", {
    scale: "log",
    description: "Time to fall to the sustain level",
  }),
  sustain: param("Sustain", 0, 1, 0.7, "%", {
    description: "Level held while the key is down",
  }),
  release: param("Release", 0.001, 6, 0.4, "s", {
    scale: "log",
    description: "Time to fade out after the key is let go",
  }),
  cutoff: param("Cutoff", 20, 20000, 2000, "Hz", {
    scale: "log",
    style: "knob",
    description: "Where the filter starts to bite",
  }),
  resonance: param("Resonance", 0, 20, 1, "dB", {
    step: 0.1,
    style: "knob",
    description: "How far the cutoff peaks above the rest, in decibels",
  }),
  time: param("Time", 0.02, 1.5, 0.35, "s", { style: "knob" }),
  feedback: param("Feedback", 0, 0.9, 0.4, "%", { style: "knob" }),
  mix: param("Mix", 0, 1, 0.3, "%", { style: "knob" }),
  drive: param("Drive", 0, 1, 0.5, "%", { style: "knob" }),
  rate: param("Rate", 0.1, 20, 5, "Hz", { scale: "log", style: "knob" }),
  depth: param("Depth", 0, 1, 0.5, "%", { style: "knob" }),
  volume: param("Volume", 0, 1, 0.7, "%", { style: "knob" }),
} satisfies Record<string, Param>;

export type ParamName = keyof typeof params;

/** A field's parameter, by the last segment of its path; undefined for a field that is not one. */
export const paramOf = (path: string): Param | undefined =>
  params[path.slice(path.lastIndexOf(".") + 1) as ParamName];

declare namespace paramOf {
  /** an array item's field shares its parameter with every other item */
  export type ArrayItem = Expect<
    Invoke<typeof paramOf, [path: "oscillators.2.level"]>,
    "matches",
    { unit: "%"; min: 0; max: 1 }
  >;

  /** a top-level field */
  export type TopLevel = Expect<
    Invoke<typeof paramOf, [path: "volume"]>,
    "matches",
    { style: "knob" }
  >;

  /** a field that is not a parameter */
  export type Unknown = Expect<
    Invoke<typeof paramOf, [path: "filter.type"]>,
    "undefined"
  >;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Where `value` sits along its control, from 0 to 1: evenly, or by its logarithm on a log scale. */
export const toPosition = (
  value: number,
  { min, max, scale }: Pick<Param, "min" | "max" | "scale">,
): number => {
  const v = clamp(value, min, max);
  if (max === min) return 0;
  if (scale === "log") return Math.log(v / min) / Math.log(max / min);
  return (v - min) / (max - min);
};

declare namespace toPosition {
  /** linear: the share of the range */
  export type Linear = Expect<
    Invoke<
      typeof toPosition,
      [value: 0.25, param: { min: 0; max: 1; scale: "linear" }]
    >,
    "=",
    0.25
  >;

  /** log: each decade takes the same share (20 Hz → 200 Hz → 2 kHz → 20 kHz) */
  export type Log = Expect<
    Invoke<
      typeof toPosition,
      [value: 200, param: { min: 20; max: 20000; scale: "log" }]
    >,
    ["~=", 1e-9],
    0.3333333333333333
  >;

  /** a value out of range sits at the end */
  export type Clamped = Expect<
    Invoke<
      typeof toPosition,
      [value: 5, param: { min: 0; max: 1; scale: "linear" }]
    >,
    "=",
    1
  >;
}

/** Rounds to `digits` significant digits, so a log control lands on 1.20 kHz rather than 1196.38… */
const significant = (value: number, digits = 3) =>
  value === 0 ? 0 : Number(value.toPrecision(digits));

/** The value at `position` (0 to 1) along a control: the inverse of `toPosition`, rounded to what the control can show. */
export const fromPosition = (
  position: number,
  { min, max, scale, step }: Pick<Param, "min" | "max" | "scale" | "step">,
): number => {
  const p = clamp(position, 0, 1);
  if (scale === "log")
    return clamp(significant(min * Math.pow(max / min, p)), min, max);
  const raw = min + p * (max - min);
  const stepped = Math.round((raw - min) / step) * step + min;
  // the step's own decimals, so 0.1 + 0.2 lands on 0.3
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return clamp(Number(stepped.toFixed(decimals)), min, max);
};

declare namespace fromPosition {
  export type Cases = Table<
    typeof fromPosition,
    [
      [
        args: [
          position: 0.5,
          param: { min: -2; max: 2; scale: "linear"; step: 1 },
        ],
        expected: 0,
      ],
      [
        args: [
          position: 0.3,
          param: { min: 0; max: 1; scale: "linear"; step: 0.01 },
        ],
        expected: 0.3,
      ],
      [
        args: [
          position: 0.5,
          param: { min: 20; max: 20000; scale: "log"; step: 0.01 },
        ],
        expected: 632,
      ],
      [
        args: [
          position: 1,
          param: { min: 0.001; max: 4; scale: "log"; step: 0.01 },
        ],
        expected: 4,
      ],
    ]
  >;
}

const signed = (value: number, digits = 0) =>
  (value > 0 ? "+" : value < 0 ? "−" : "±") + Math.abs(value).toFixed(digits);

/** A value as a hardware display would print it: `120 ms`, `2.4 kHz`, `+7 ct`, `45%`. */
export const format = (
  value: number,
  { unit }: Pick<Param, "unit">,
): string => {
  switch (unit) {
    case "s":
      return value < 1
        ? `${Math.round(value * 1000)} ms`
        : `${value.toFixed(2)} s`;
    case "Hz":
      if (value >= 1000)
        return `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)} kHz`;
      return value < 100 ? `${value.toFixed(1)} Hz` : `${Math.round(value)} Hz`;
    case "%":
      return `${Math.round(value * 100)}%`;
    case "ct":
      return `${signed(value)} ct`;
    case "oct":
      return value === 0 ? "0" : signed(value);
    case "dB":
      return `${value.toFixed(1)} dB`;
  }
};

declare namespace format {
  export type Cases = Table<
    typeof format,
    [
      [args: [value: 0.12, param: { unit: "s" }], expected: "120 ms"],
      [args: [value: 1.5, param: { unit: "s" }], expected: "1.50 s"],
      [args: [value: 2400, param: { unit: "Hz" }], expected: "2.40 kHz"],
      [args: [value: 12000, param: { unit: "Hz" }], expected: "12.0 kHz"],
      [args: [value: 440, param: { unit: "Hz" }], expected: "440 Hz"],
      [args: [value: 5, param: { unit: "Hz" }], expected: "5.0 Hz"],
      [args: [value: 0.45, param: { unit: "%" }], expected: "45%"],
      [args: [value: 7, param: { unit: "ct" }], expected: "+7 ct"],
      [args: [value: -12, param: { unit: "ct" }], expected: "−12 ct"],
      [args: [value: -1, param: { unit: "oct" }], expected: "−1"],
      [args: [value: 0, param: { unit: "oct" }], expected: "0"],
      [args: [value: 2, param: { unit: "dB" }], expected: "2.0 dB"],
    ]
  >;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

type Range = Pick<Param, "min" | "max" | "step" | "scale">;

/** An `<input type="range">`'s bounds for a parameter: its own range and step, or 0 to 1 in fine steps along a log scale. */
export const rangeOf = (param: Range) =>
  param.scale === "log"
    ? { min: 0, max: 1, step: 0.001 }
    : { min: param.min, max: param.max, step: param.step };

declare namespace rangeOf {
  export type Linear = Expect<
    Invoke<
      typeof rangeOf,
      [param: { min: -2; max: 2; step: 1; scale: "linear" }]
    >,
    "=",
    { min: -2; max: 2; step: 1 }
  >;

  export type Log = Expect<
    Invoke<
      typeof rangeOf,
      [param: { min: 20; max: 20000; step: 0.01; scale: "log" }]
    >,
    "=",
    { min: 0; max: 1; step: 0.001 }
  >;
}

/** What a range input is set to for `value`. */
export const toControl = (value: number, param: Range) =>
  param.scale === "log" ? toPosition(value, param) : value;

/** The value a range input's `raw` reading stands for. */
export const fromControl = (raw: number, param: Range) =>
  param.scale === "log"
    ? fromPosition(raw, param)
    : fromPosition(toPosition(raw, param), param);

declare namespace fromControl {
  export type Cases = Table<
    typeof fromControl,
    [
      [
        args: [raw: 1, param: { min: -2; max: 2; step: 1; scale: "linear" }],
        expected: 1,
      ],
      [
        args: [
          raw: 0.5,
          param: { min: 20; max: 20000; step: 0.01; scale: "log" },
        ],
        expected: 632,
      ],
      [
        args: [
          raw: 0.123456,
          param: { min: 0; max: 1; step: 0.01; scale: "linear" },
        ],
        expected: 0.12,
      ],
    ]
  >;
}

/**
 * The value `steps` key presses away along a control: a hundredth of its
 * travel each (Page Up and Down take ten), and never less than one step, so
 * a control with five positions still moves.
 */
export const nudge = (value: number, param: Range, steps: number): number => {
  const next = fromPosition(toPosition(value, param) + steps * 0.01, param);
  if (next !== value || steps === 0) return next;
  return clamp(value + Math.sign(steps) * param.step, param.min, param.max);
};

declare namespace nudge {
  type Level = { min: 0; max: 1; step: 0.01; scale: "linear" };
  type Octave = { min: -2; max: 2; step: 1; scale: "linear" };
  type Cutoff = { min: 20; max: 20000; step: 0.01; scale: "log" };

  export type Cases = Table<
    typeof nudge,
    [
      [args: [value: 0.5, param: Level, steps: 1], expected: 0.51],
      [args: [value: 0.5, param: Level, steps: -10], expected: 0.4],
      [args: [value: 0, param: Octave, steps: 1], expected: 1],
      [args: [value: 2, param: Octave, steps: 1], expected: 2],
      [args: [value: 20000, param: Cutoff, steps: -100], expected: 20],
    ]
  >;
}
