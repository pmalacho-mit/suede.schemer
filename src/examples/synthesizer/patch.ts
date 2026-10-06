// The patch: its JSON Schema (what the form is drawn from), its type, the
// presets, and the pure helpers that keep a patch whole while it is edited.
import type { JSONSchema7 } from "json-schema";
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import type { Schema } from "../../../release";
import { params, type ParamName } from "./params.ts";
import type { defaultAt } from "./patch.harness.ts";

export const waves = ["sine", "square", "sawtooth", "triangle"] as const;
export type Wave = (typeof waves)[number];

export type Oscillator = {
  wave: Wave;
  octave: number;
  detune: number;
  level: number;
};

export type Envelope = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type Filter =
  | { type: "off" }
  | { type: "lowpass"; cutoff: number; resonance: number }
  | { type: "highpass"; cutoff: number; resonance: number };

export type Effect =
  | { type: "delay"; time: number; feedback: number; mix: number }
  | { type: "distortion"; drive: number }
  | { type: "tremolo"; rate: number; depth: number };

export type Patch = {
  name: string;
  oscillators: Oscillator[];
  envelope: Envelope;
  filter: Filter;
  effects: Effect[];
  volume: number;
};

export const MAX_OSCILLATORS = 3;
export const MAX_EFFECTS = 4;

/** A number field, from its row in the parameter table. */
const number = (name: ParamName, overrides: JSONSchema7 = {}): JSONSchema7 => {
  const { title, description, min, max, integer } = params[name];
  return {
    type: integer ? "integer" : "number",
    title,
    ...(description ? { description } : {}),
    minimum: min,
    maximum: max,
    default: params[name].default,
    ...overrides,
  };
};

/** An object whose every property is required (an absent one would be drawn as opt-in). */
const object = (
  title: string,
  properties: Record<string, JSONSchema7>,
  rest: JSONSchema7 = {},
): JSONSchema7 => ({
  type: "object",
  title,
  properties,
  required: Object.keys(properties),
  ...rest,
});

/** A variant of a `oneOf`, told apart by its `type` const. */
const variant = (
  type: string,
  title: string,
  properties: Record<string, JSONSchema7> = {},
): JSONSchema7 =>
  object(title, { type: { type: "string", const: type }, ...properties });

export const schema: JSONSchema7 = object(
  "Patch",
  {
    name: {
      type: "string",
      title: "Patch name",
      default: "Init",
    },
    oscillators: {
      type: "array",
      title: "Oscillators",
      description: "Up to three, summed into one voice",
      minItems: 1,
      maxItems: MAX_OSCILLATORS,
      items: object("Oscillator", {
        wave: {
          type: "string",
          title: "Wave",
          enum: [...waves],
          default: "sawtooth",
        },
        octave: number("octave"),
        detune: number("detune"),
        level: number("level"),
      }),
    },
    envelope: object(
      "Envelope",
      {
        attack: number("attack"),
        decay: number("decay"),
        sustain: number("sustain"),
        release: number("release"),
      },
      { description: "How each note rises and falls" },
    ),
    filter: {
      title: "Filter",
      description: "Shapes the tone of the mix",
      oneOf: [
        variant("off", "Off"),
        variant("lowpass", "Low-pass", {
          cutoff: number("cutoff"),
          resonance: number("resonance"),
        }),
        variant("highpass", "High-pass", {
          cutoff: number("cutoff", { default: 400 }),
          resonance: number("resonance"),
        }),
      ],
    },
    effects: {
      type: "array",
      title: "Effects",
      description: "Applied in order, left to right",
      maxItems: MAX_EFFECTS,
      items: {
        title: "Effect",
        oneOf: [
          variant("delay", "Delay", {
            time: number("time"),
            feedback: number("feedback"),
            mix: number("mix"),
          }),
          variant("distortion", "Distortion", { drive: number("drive") }),
          variant("tremolo", "Tremolo", {
            rate: number("rate"),
            depth: number("depth"),
          }),
        ],
      },
    },
    volume: number("volume", { title: "Master" }),
  },
  { description: "A three-oscillator subtractive synthesizer" },
);

declare namespace schema {
  /** a new oscillator, as the "add" button makes it from the schema's defaults */
  export type AnOscillator = Expect<
    Invoke<typeof defaultAt, [pointer: "/properties/oscillators/items"]>,
    "=",
    { wave: "sawtooth"; octave: 0; detune: 0; level: 0.6 }
  >;

  /** a variant just chosen: its const and every one of its fields */
  export type AVariant = Expect<
    Invoke<typeof defaultAt, [pointer: "/properties/filter/oneOf/2"]>,
    "=",
    { type: "highpass"; cutoff: 400; resonance: 1 }
  >;

  /** a new effect: the first variant */
  export type AOneOf = Expect<
    Invoke<typeof defaultAt, [pointer: "/properties/effects/items"]>,
    "=",
    { type: "delay"; time: 0.35; feedback: 0.4; mix: 0.3 }
  >;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export const presets = {
  "Warm pad": {
    name: "Warm pad",
    oscillators: [
      { wave: "sawtooth", octave: 0, detune: -9, level: 0.55 },
      { wave: "sawtooth", octave: 0, detune: 9, level: 0.55 },
      { wave: "triangle", octave: -1, detune: 0, level: 0.4 },
    ],
    envelope: { attack: 0.9, decay: 1.2, sustain: 0.75, release: 2.2 },
    filter: { type: "lowpass", cutoff: 1400, resonance: 1.5 },
    effects: [
      { type: "tremolo", rate: 0.5, depth: 0.25 },
      { type: "delay", time: 0.42, feedback: 0.45, mix: 0.3 },
    ],
    volume: 0.7,
  },
  Pluck: {
    name: "Pluck",
    oscillators: [
      { wave: "square", octave: 0, detune: 0, level: 0.6 },
      { wave: "sine", octave: 1, detune: 3, level: 0.3 },
    ],
    envelope: { attack: 0.002, decay: 0.28, sustain: 0, release: 0.25 },
    filter: { type: "lowpass", cutoff: 3200, resonance: 4 },
    effects: [{ type: "delay", time: 0.24, feedback: 0.35, mix: 0.25 }],
    volume: 0.75,
  },
  Lead: {
    name: "Lead",
    oscillators: [
      { wave: "sawtooth", octave: 0, detune: 0, level: 0.7 },
      { wave: "square", octave: 1, detune: 6, level: 0.35 },
    ],
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.18 },
    filter: { type: "lowpass", cutoff: 4800, resonance: 6 },
    effects: [
      { type: "distortion", drive: 0.35 },
      { type: "delay", time: 0.33, feedback: 0.3, mix: 0.2 },
    ],
    volume: 0.6,
  },
  Bass: {
    name: "Bass",
    oscillators: [
      { wave: "sawtooth", octave: -1, detune: 0, level: 0.8 },
      { wave: "sine", octave: -2, detune: 0, level: 0.6 },
    ],
    envelope: { attack: 0.004, decay: 0.35, sustain: 0.55, release: 0.12 },
    filter: { type: "lowpass", cutoff: 620, resonance: 8 },
    effects: [{ type: "distortion", drive: 0.2 }],
    volume: 0.75,
  },
} satisfies Record<string, Patch>;

export type PresetName = keyof typeof presets;
export const presetNames = Object.keys(presets) as PresetName[];

/** A fresh copy of a preset, to load into the model. */
export const preset = (name: PresetName): Patch =>
  structuredClone(presets[name]) as Patch;

const same = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) =>
      same(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    )
  );
};

/** The preset `patch` is, untouched; undefined once anything was changed. */
export const matchPreset = (patch: unknown): PresetName | undefined =>
  presetNames.find((name) => same(patch, presets[name]));

declare namespace matchPreset {
  /** a preset as it was loaded */
  export type Loaded = Expect<
    Invoke<typeof matchPreset, [patch: Invoke<typeof preset, [name: "Pluck"]>]>,
    "=",
    "Pluck"
  >;

  /** anything else */
  export type Edited = Expect<
    Invoke<typeof matchPreset, [patch: { volume: 0.1 }]>,
    "undefined"
  >;
}

// ---------------------------------------------------------------------------
// Keeping a patch whole
// ---------------------------------------------------------------------------

const clamp = (value: unknown, name: ParamName): number => {
  const { min, max, default: fallback, integer } = params[name];
  const n =
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  const clamped = Math.min(max, Math.max(min, n));
  return integer ? Math.round(clamped) : clamped;
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const oscillator = (value: unknown): Oscillator => {
  const o = record(value);
  return {
    wave: waves.includes(o.wave as Wave) ? (o.wave as Wave) : "sawtooth",
    octave: clamp(o.octave, "octave"),
    detune: clamp(o.detune, "detune"),
    level: clamp(o.level, "level"),
  };
};

const filter = (value: unknown): Filter => {
  const f = record(value);
  if (f.type !== "lowpass" && f.type !== "highpass") return { type: "off" };
  return {
    type: f.type,
    cutoff: clamp(
      f.cutoff ?? (f.type === "highpass" ? 400 : undefined),
      "cutoff",
    ),
    resonance: clamp(f.resonance, "resonance"),
  };
};

const effect = (value: unknown): Effect | undefined => {
  const e = record(value);
  switch (e.type) {
    case "delay":
      return {
        type: "delay",
        time: clamp(e.time, "time"),
        feedback: clamp(e.feedback, "feedback"),
        mix: clamp(e.mix, "mix"),
      };
    case "distortion":
      return { type: "distortion", drive: clamp(e.drive, "drive") };
    case "tremolo":
      return {
        type: "tremolo",
        rate: clamp(e.rate, "rate"),
        depth: clamp(e.depth, "depth"),
      };
  }
};

/**
 * A whole, playable patch from whatever the form holds: a missing field gets
 * its default, a number out of range is clamped, an unknown effect is left
 * out. The sound and the displays read this, never the raw data.
 */
export const normalize = (data: unknown): Patch => {
  const d = record(data);
  const e = record(d.envelope);
  const oscillators = Array.isArray(d.oscillators)
    ? d.oscillators.slice(0, MAX_OSCILLATORS).map(oscillator)
    : [];
  return {
    name: typeof d.name === "string" ? d.name : "Init",
    oscillators,
    envelope: {
      attack: clamp(e.attack, "attack"),
      decay: clamp(e.decay, "decay"),
      sustain: clamp(e.sustain, "sustain"),
      release: clamp(e.release, "release"),
    },
    filter: filter(d.filter),
    effects: Array.isArray(d.effects)
      ? d.effects
          .map(effect)
          .filter((x): x is Effect => x !== undefined)
          .slice(0, MAX_EFFECTS)
      : [],
    volume: clamp(d.volume, "volume"),
  };
};

declare namespace normalize {
  /** an empty object becomes the defaults */
  export type Empty = Expect<
    Invoke<typeof normalize, [data: {}]>,
    "=",
    {
      name: "Init";
      oscillators: [];
      envelope: { attack: 0.01; decay: 0.3; sustain: 0.7; release: 0.4 };
      filter: { type: "off" };
      effects: [];
      volume: 0.7;
    }
  >;

  /** a variant switched to by the form, before its fields are filled, gets their defaults */
  export type HalfAFilter = Expect<
    Invoke<typeof normalize, [data: { filter: { type: "highpass" } }]>,
    "matches",
    { filter: { type: "highpass"; cutoff: 400; resonance: 1 } }
  >;

  /** out-of-range numbers are clamped, octaves rounded */
  export type Clamped = Expect<
    Invoke<
      typeof normalize,
      [
        data: {
          oscillators: [{ wave: "sine"; octave: 7.4; detune: -80; level: 2 }];
        },
      ]
    >,
    "matches",
    { oscillators: [{ wave: "sine"; octave: 2; detune: -50; level: 1 }] }
  >;

  /** unknown effects are left out */
  export type UnknownEffect = Expect<
    Invoke<
      typeof normalize,
      [
        data: {
          effects: [{ type: "chorus" }, { type: "distortion"; drive: 0.2 }];
        },
      ]
    >,
    "matches",
    { effects: [{ type: "distortion"; drive: 0.2 }] }
  >;
}


/** The list with the item at `from` moved `by` places (an effect earlier or later in the chain); a move off either end changes nothing. */
export const moved = <T>(list: readonly T[], from: number, by: number): T[] => {
  const to = from + by;
  if (to < 0 || to >= list.length || from < 0 || from >= list.length)
    return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

declare namespace moved {
  export type Cases = Table<
    typeof moved<string>,
    [
      [
        args: [list: ["a", "b", "c"], from: 2, by: -1],
        expected: ["a", "c", "b"],
      ],
      [
        args: [list: ["a", "b", "c"], from: 0, by: 2],
        expected: ["b", "c", "a"],
      ],
      [
        args: [list: ["a", "b", "c"], from: 0, by: -1],
        expected: ["a", "b", "c"],
      ],
    ]
  >;
}
