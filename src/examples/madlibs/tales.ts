import type { JSONSchema7 } from "json-schema";
import type {
  Expect,
  Invoke,
  Table,
  Throws,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import type { root } from "../../../release/index.ts";
import { isKind, kinds, pool, type Kind, type KindName } from "./words.ts";
import { stories, type Story } from "./stories.ts";
import type {
  distinctWords,
  drawnFields,
  readsTheSameAsItIsTold,
  reusesABlank,
  saidInTheEnd,
  stepsOf,
} from "./tales.harness.ts";

// ---------------------------------------------------------------------------
// Parsing a template
// ---------------------------------------------------------------------------

/** One word the story asks for: a field of the form. */
export type Blank = {
  /** its property in the form's data */
  key: string;
  kind: KindName;
  /** the field's title: "Adjective", then "Another adjective", … */
  title: string;
  /** how many times the story uses the word */
  uses: number;
};

/** A run of the story's own text, or a blank (by key). */
export type Part = string | { blank: string };

/** A template, parsed: its blanks in the order the story first uses them, and its paragraphs. */
export type Parsed = { blanks: Blank[]; paragraphs: Part[][] };

const blankPattern = /\{([a-zA-Z]+)(?::([a-zA-Z]\w*))?\}/g;

/** "Adjective", "Another adjective", "Yet another adjective", "Adjective no. 4" */
export const titleFor = (label: string, ordinal: number) => {
  const lower = label[0].toLowerCase() + label.slice(1);
  if (ordinal <= 1) return label;
  if (ordinal === 2) return `Another ${lower}`;
  if (ordinal === 3) return `Yet another ${lower}`;
  return `${label} no. ${ordinal}`;
};

declare namespace titleFor {
  export type Ordinals = Table<
    typeof titleFor,
    [
      [args: [label: "Adjective", ordinal: 1], expected: "Adjective"],
      [args: [label: "Adjective", ordinal: 2], expected: "Another adjective"],
      [
        args: [label: "Plural noun", ordinal: 3],
        expected: "Yet another plural noun",
      ],
      [args: [label: "Noun", ordinal: 4], expected: "Noun no. 4"],
    ]
  >;
}

/**
 * Splits a template into text and blanks. `{kind}` is a fresh blank, keyed
 * `kind`, then `kind2`, `kind3`…; `{kind:name}` is keyed `name`, and every
 * blank of that name is one word.
 */
export const parse = (template: string): Parsed => {
  const named = new Set(
    [...template.matchAll(blankPattern)].map(([, , name]) => name),
  );
  const blanks = new Map<string, Blank>();
  const ordinals = new Map<KindName, number>();

  const freshKey = (kind: KindName) => {
    for (let i = 1; ; i++) {
      const key = i === 1 ? kind : `${kind}${i}`;
      if (!blanks.has(key) && !named.has(key)) return key;
    }
  };

  const use = (kind: string, name: string | undefined): string => {
    if (!isKind(kind)) throw new Error(`Unknown part of speech "{${kind}}"`);
    if (name === "story")
      throw new Error(`"story" names the story itself; pick another name`);
    const existing = name ? blanks.get(name) : undefined;
    if (existing) {
      if (existing.kind !== kind)
        throw new Error(
          `"${name}" is a ${existing.kind} and a ${kind}; a name is one word`,
        );
      existing.uses++;
      return existing.key;
    }
    const ordinal = (ordinals.get(kind) ?? 0) + 1;
    ordinals.set(kind, ordinal);
    const key = name ?? freshKey(kind);
    blanks.set(key, {
      key,
      kind,
      title: titleFor(kinds[kind].label, ordinal),
      uses: 1,
    });
    return key;
  };

  const paragraphs = template
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const parts: Part[] = [];
      let at = 0;
      for (const match of paragraph.matchAll(blankPattern)) {
        if (match.index > at) parts.push(paragraph.slice(at, match.index));
        parts.push({ blank: use(match[1], match[2]) });
        at = match.index + match[0].length;
      }
      if (at < paragraph.length) parts.push(paragraph.slice(at));
      return parts;
    });

  return { blanks: [...blanks.values()], paragraphs };
};

declare namespace parse {
  /** text and blanks, in order */
  export type SplitsTextAndBlanks = Expect<
    Invoke<typeof parse, [template: "A {adjective} {noun}!"]>["paragraphs"],
    "=",
    [["A ", { blank: "adjective" }, " ", { blank: "noun" }, "!"]]
  >;

  /** a blank line starts a paragraph */
  export type Paragraphs = Expect<
    Invoke<typeof parse, [template: "One {noun}.\n\nTwo."]>["paragraphs"],
    "=",
    [["One ", { blank: "noun" }, "."], ["Two."]]
  >;

  /** a second blank of a kind is a field of its own, titled so */
  export type FreshBlanksOfAKind = Expect<
    Invoke<typeof parse, [template: "{noun} and {noun} and {noun}"]>["blanks"],
    "matches",
    [
      { key: "noun"; title: "Noun" },
      { key: "noun2"; title: "Another noun" },
      { key: "noun3"; title: "Yet another noun" },
    ]
  >;

  /** a named blank the story uses twice is one field */
  export type NamedBlanksAreOneField = Expect<
    Invoke<
      typeof parse,
      [
        template: "Dr. {celebrity:doc} met {celebrity}. Dr. {celebrity:doc} fled.",
      ]
    >["blanks"],
    "matches",
    [
      { key: "doc"; kind: "celebrity"; uses: 2; title: "Celebrity" },
      { key: "celebrity"; uses: 1; title: "Another celebrity" },
    ]
  >;

  /** a fresh key steps around a name used later */
  export type FreshKeysAvoidNames = Expect<
    Invoke<typeof parse, [template: "{noun} {noun:noun2}"]>["blanks"],
    "matches",
    [{ key: "noun" }, { key: "noun2" }]
  >;

  export type UnknownKind = Throws<
    Invoke<typeof parse, [template: "a {gerund}"]>,
    "Unknown part of speech"
  >;

  export type OneNameOneKind = Throws<
    Invoke<typeof parse, [template: "{noun:x} {verb:x}"]>,
    "a name is one word"
  >;

  export type StoryIsReserved = Throws<
    Invoke<typeof parse, [template: "{noun:story}"]>,
    "names the story"
  >;
}

/** A story with its template parsed. */
export type Tale = Story & Parsed;

export const tales: readonly Tale[] = stories.map((story) => ({
  ...story,
  ...parse(story.template),
}));

/** The story with this id, or the first one. */
export const taleOf = (id: string | undefined): Tale =>
  tales.find((tale) => tale.id === id) ?? tales[0];

declare namespace taleOf {
  export type ById = Expect<
    Invoke<typeof taleOf, [id: "horoscope"]>,
    "matches",
    { id: "horoscope"; title: "Your Horoscope" }
  >;
  export type FallsBackToTheFirst = Expect<
    Invoke<typeof taleOf, [id: "nope"]>["id"],
    "=",
    "dragon"
  >;
  /** each story uses at least one word twice, asked for once */
  export type EveryStoryReusesABlank = Expect<
    typeof tales,
    "every",
    typeof reusesABlank
  >;
}

// ---------------------------------------------------------------------------
// The schema
// ---------------------------------------------------------------------------

const times = (n: number) => (n === 2 ? "twice" : `${n} times`);

/** A blank's field: a titled string, a choice (`enum`) or a bounded integer. */
export const blankSchema = (blank: Blank): JSONSchema7 => {
  const kind: Kind = kinds[blank.kind];
  const description =
    blank.uses > 1 ? `${kind.hint} (used ${times(blank.uses)})` : kind.hint;
  const common = { title: blank.title, description };
  switch (kind.type) {
    case "word":
      return { type: "string", minLength: 1, ...common };
    case "choice":
      return { type: "string", enum: [...kind.options], ...common };
    case "number":
      return {
        type: "integer",
        minimum: kind.min,
        maximum: kind.max,
        ...common,
      };
  }
};

declare namespace blankSchema {
  export type Word = Expect<
    Invoke<
      typeof blankSchema,
      [
        blank: {
          key: "adjective";
          kind: "adjective";
          title: "Adjective";
          uses: 1;
        },
      ]
    >,
    "=",
    {
      type: "string";
      minLength: 1;
      title: "Adjective";
      description: "describes a thing: fuzzy, loud, suspicious…";
    }
  >;

  export type IntegerWithBounds = Expect<
    Invoke<
      typeof blankSchema,
      [blank: { key: "number"; kind: "number"; title: "Number"; uses: 1 }]
    >,
    "matches",
    { type: "integer"; minimum: 2; maximum: 999 }
  >;

  export type ColourIsAnEnum = Expect<
    Invoke<
      typeof blankSchema,
      [blank: { key: "colour"; kind: "colour"; title: "Colour"; uses: 1 }]
    >["enum"],
    "includes",
    "plaid"
  >;

  /** the hint says when the story uses the word more than once */
  export type SaysWhenUsedTwice = Expect<
    Invoke<
      typeof blankSchema,
      [blank: { key: "doc"; kind: "celebrity"; title: "Celebrity"; uses: 2 }]
    >["description"],
    "endsWith",
    "(used twice)"
  >;
}

/** One story's variant: its `story` const (the discriminator), then its blanks, all required. */
export const variantSchema = (story: Story): JSONSchema7 => {
  const { blanks } = parse(story.template);
  return {
    type: "object",
    title: story.title,
    description: story.blurb,
    properties: {
      story: { type: "string", const: story.id },
      ...Object.fromEntries(blanks.map((b) => [b.key, blankSchema(b)])),
    },
    required: ["story", ...blanks.map((b) => b.key)],
  };
};

/** The form: one `oneOf` variant per story, told apart by `story`. */
export const schemaFor = (stories: readonly Story[]): JSONSchema7 => ({
  title: "Pick a story",
  oneOf: stories.map(variantSchema),
});

declare namespace schemaFor {
  export type OneVariantPerStory = Expect<
    Invoke<
      typeof schemaFor,
      [
        stories: [
          { id: "a"; title: "A"; blurb: "a"; template: "{noun}" },
          { id: "b"; title: "B"; blurb: "b"; template: "{verb} {verb}" },
        ],
      ]
    >,
    "matches",
    {
      oneOf: [
        {
          title: "A";
          properties: { story: { const: "a" }; noun: { title: "Noun" } };
          required: ["story", "noun"];
        },
        {
          title: "B";
          properties: {
            story: { const: "b" };
            verb: { title: "Verb" };
            verb2: { title: "Another verb" };
          };
          required: ["story", "verb", "verb2"];
        },
      ];
    }
  >;

  /** a story's fields, as the library draws them: the const first, then each blank once, in story order */
  export type FieldsInStoryOrder = Expect<
    Invoke<typeof drawnFields, [id: "dragon"]>,
    "=",
    [
      "story: string = dragon",
      "dentist: string",
      "number: number 2–999",
      "adjective: string",
      "adverb: string",
      "noun: string",
      "verbPast: string",
      "noun2: string",
      "food: string",
      "exclamation: string",
      "colour: string of 9",
      "verbIng: string",
      "place: string",
      "pluralNoun: string",
      "animal: string",
      "noun3: string",
    ]
  >;

  /** the library reads it as a oneOf of objects, each with a const discriminator */
  export type TheLibraryDrawsAVariantPerStory = Expect<
    Invoke<
      typeof root,
      [schema: Invoke<typeof schemaFor, [stories: typeof stories]>]
    >,
    "matches",
    {
      kind: "oneOf";
      variants: [
        { kind: "object"; title: "The Dragon's Dentist" },
        { kind: "object"; title: "Space Station Log" },
        { kind: "object"; title: "Grandma's Casserole" },
        { kind: "object"; title: "Your Horoscope" },
      ];
    }
  >;
}

// ---------------------------------------------------------------------------
// Filling a template
// ---------------------------------------------------------------------------

export type Word = string | number;

/** The form's data: which story, and a word per blank. */
export type Answers = { story: string; [key: string]: Word | undefined };

/** Whether a blank has a word: any number, or a string with more than spaces. */
export const isFilled = (value: unknown): value is Word =>
  typeof value === "number"
    ? Number.isFinite(value)
    : typeof value === "string" && value.trim() !== "";

declare namespace isFilled {
  export type Cases = Table<
    typeof isFilled,
    [
      [args: [value: "spatula"], expected: true],
      [args: [value: "  "], expected: false],
      [args: [value: 42], expected: true],
      [args: [value: undefined], expected: false],
    ]
  >;
}

/** What an empty blank shows: "____ (noun)". */
export const placeholder = (blank: Pick<Blank, "kind">) =>
  `____ (${kinds[blank.kind].short})`;

/** A run of the story as shown: text, or a blank with its word (or its placeholder). */
export type Segment =
  | { text: string }
  | { text: string; blank: Blank; filled: boolean };

/** The story's paragraphs with `answers` written into the blanks. */
export const fill = (tale: Parsed, answers: Partial<Answers>): Segment[][] => {
  const byKey = new Map(tale.blanks.map((blank) => [blank.key, blank]));
  return tale.paragraphs.map((parts) =>
    parts.map((part) => {
      if (typeof part === "string") return { text: part };
      const blank = byKey.get(part.blank)!;
      const value = answers[part.blank];
      return isFilled(value)
        ? { text: String(value).trim(), blank, filled: true }
        : { text: placeholder(blank), blank, filled: false };
    }),
  );
};

declare namespace fill {
  export type WritesTheWords = Expect<
    Invoke<
      typeof fill,
      [
        tale: Invoke<typeof parse, [template: "A {adjective} cat."]>,
        answers: { adjective: "soggy" },
      ]
    >,
    "matches",
    [
      [
        { text: "A " },
        { text: "soggy"; filled: true; blank: { kind: "adjective" } },
        { text: " cat." },
      ],
    ]
  >;
}

/** The filled story as plain text. */
export const tell = (tale: Parsed, answers: Partial<Answers>) =>
  fill(tale, answers)
    .map((segments) => segments.map(({ text }) => text).join(""))
    .join("\n\n");

declare namespace tell {
  export type FilledAndUnfilled = Expect<
    Invoke<
      typeof tell,
      [
        tale: Invoke<
          typeof parse,
          [template: "{number} {adjective} {pluralNoun}.\n\nThe end."]
        >,
        answers: { number: 7; adjective: " sticky " },
      ]
    >,
    "=",
    "7 sticky ____ (plural noun).\n\nThe end."
  >;

  /** a word the story uses twice is written in twice */
  export type ReusedWord = Expect<
    Invoke<
      typeof tell,
      [
        tale: Invoke<typeof parse, [template: "{animal:pet}, {animal:pet}!"]>,
        answers: { pet: "Wombat" },
      ]
    >,
    "=",
    "Wombat, Wombat!"
  >;
}

/** The blanks still waiting for a word. */
export const missing = (tale: Parsed, answers: Partial<Answers>) =>
  tale.blanks.filter((blank) => !isFilled(answers[blank.key]));

declare namespace missing {
  export type Unfilled = Expect<
    Invoke<
      typeof missing,
      [
        tale: Invoke<typeof parse, [template: "{noun} {verb} {number}"]>,
        answers: { noun: "cactus"; verb: "" },
      ]
    >,
    "matches",
    [{ key: "verb" }, { key: "number" }]
  >;
}

// ---------------------------------------------------------------------------
// Reading it aloud
// ---------------------------------------------------------------------------

/** How many characters of the story there are. */
export const length = (paragraphs: Segment[][]) =>
  paragraphs.flat().reduce((sum, { text }) => sum + text.length, 0);

/**
 * The first `chars` characters of the story, as segments. An empty blank is
 * shown whole once reached, never as part of its placeholder.
 */
export const clip = (paragraphs: Segment[][], chars: number): Segment[][] => {
  const shown: Segment[][] = [];
  let left = chars;
  for (const segments of paragraphs) {
    if (left <= 0) break;
    const kept: Segment[] = [];
    for (const segment of segments) {
      if (left <= 0) break;
      const atomic = "blank" in segment && !segment.filled;
      const text = atomic ? segment.text : segment.text.slice(0, left);
      kept.push({ ...segment, text });
      left -= segment.text.length;
    }
    shown.push(kept);
  }
  return shown;
};

declare namespace clip {
  export type CutsTextAndWords = Expect<
    Invoke<
      typeof clip,
      [
        paragraphs: Invoke<
          typeof fill,
          [
            tale: Invoke<typeof parse, [template: "A {noun}.\n\nEnd."]>,
            answers: { noun: "spatula" },
          ]
        >,
        chars: 5,
      ]
    >,
    "matches",
    [[{ text: "A " }, { text: "spa" }]]
  >;

  export type EmptyBlanksAreWhole = Expect<
    Invoke<
      typeof clip,
      [
        paragraphs: Invoke<
          typeof fill,
          [tale: Invoke<typeof parse, [template: "A {noun}."]>, answers: {}]
        >,
        chars: 3,
      ]
    >,
    "matches",
    [[{ text: "A " }, { text: "____ (noun)" }]]
  >;
}

/** One beat of the reading: how much of the story shows, and the words said so far that changed. */
export type Beat = { shown: number; said: Record<string, Word> };

/**
 * The story told `step` characters at a time, as beats to stream into a
 * model: each beat's `said` is what `applyPartial` adds, a blank's word
 * arriving letter by letter (a number digit by digit) as the reading reaches
 * it. Showing `clip(fill(tale, streamed), shown)` at every beat reads the
 * same as the finished story, cut to `shown`.
 */
export const recital = (
  tale: Parsed,
  answers: Partial<Answers>,
  step = 2,
): Beat[] => {
  const full = fill(tale, answers);
  const total = length(full);
  const said = new Map<string, string>();
  const beats: Beat[] = [];
  for (let shown = 0; shown < total; ) {
    shown = Math.min(total, shown + Math.max(1, step));
    const changed: Record<string, Word> = {};
    for (const segment of clip(full, shown).flat()) {
      if (!("blank" in segment) || !segment.filled) continue;
      const { key } = segment.blank;
      // a word the story uses again is already said: only ever say more of it
      if ((said.get(key)?.length ?? 0) >= segment.text.length) continue;
      said.set(key, segment.text);
      changed[key] =
        typeof answers[key] === "number" ? Number(segment.text) : segment.text;
    }
    beats.push({ shown, said: changed });
  }
  return beats;
};

declare namespace recital {
  export type LetterByLetter = Expect<
    Invoke<
      typeof recital,
      [
        tale: Invoke<typeof parse, [template: "A {noun}"]>,
        answers: { noun: "cat" },
        step: 1,
      ]
    >,
    "=",
    [
      { shown: 1; said: {} },
      { shown: 2; said: {} },
      { shown: 3; said: { noun: "c" } },
      { shown: 4; said: { noun: "ca" } },
      { shown: 5; said: { noun: "cat" } },
    ]
  >;

  export type DigitByDigit = Expect<
    Invoke<
      typeof recital,
      [
        tale: Invoke<typeof parse, [template: "{number}"]>,
        answers: { number: 42 },
        step: 1,
      ]
    >,
    "matches",
    [{ said: { number: 4 } }, { said: { number: 42 } }]
  >;

  /** by the end, every word has been said in full */
  export type SaysEveryWord = Expect<
    Invoke<typeof saidInTheEnd, [id: "station", seed: 3]>,
    "=",
    true
  >;

  /** streaming the beats into a model, the story reads as the finished one, cut short */
  export type ReadsAsTold = Expect<
    Invoke<typeof readsTheSameAsItIsTold, [id: "dragon", seed: 11, step: 3]>,
    "=",
    true
  >;

  /** each beat moves on; the last shows it all */
  export type Steps = Expect<
    Invoke<
      typeof stepsOf,
      [template: "{noun}!", answers: { noun: "hat" }, step: 2]
    >,
    "=",
    [2, 4]
  >;
}

// ---------------------------------------------------------------------------
// Surprise me
// ---------------------------------------------------------------------------

/** A small seeded random number generator (mulberry32): the same seed, the same numbers. */
export const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

declare namespace random {
  export type Between0And1 = Expect<
    Invoke<Invoke<typeof random, [seed: 1]>>,
    "<",
    1
  >;
  export type Seeded = Expect<
    Invoke<Invoke<typeof random, [seed: 42]>>,
    "=",
    Invoke<Invoke<typeof random, [seed: 42]>>
  >;
}

/** A word for every blank, drawn from the kind's list with no repeats until the list runs out. */
export const surprise = (tale: Parsed, seed: number): Record<string, Word> => {
  const next = random(seed);
  const decks = new Map<KindName, Word[]>();
  const draw = (kind: KindName) => {
    let deck = decks.get(kind);
    if (!deck?.length) {
      deck = [...pool(kind)];
      // Fisher–Yates
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      decks.set(kind, deck);
    }
    return deck.pop()!;
  };
  return Object.fromEntries(tale.blanks.map((b) => [b.key, draw(b.kind)]));
};

declare namespace surprise {
  /** every blank gets a word */
  export type FillsEveryBlank = Expect<
    Invoke<
      typeof missing,
      [
        tale: Invoke<typeof taleOf, [id: "casserole"]>,
        answers: Invoke<
          typeof surprise,
          [tale: Invoke<typeof taleOf, [id: "casserole"]>, seed: 5]
        >,
      ]
    >,
    "isEmpty"
  >;

  /** the same seed, the same words */
  export type Seeded = Expect<
    Invoke<
      typeof surprise,
      [
        tale: Invoke<
          typeof parse,
          [template: "{noun} {verb} {colour} {number}"]
        >,
        seed: 9,
      ]
    >,
    "=",
    Invoke<
      typeof surprise,
      [
        tale: Invoke<
          typeof parse,
          [template: "{noun} {verb} {colour} {number}"]
        >,
        seed: 9,
      ]
    >
  >;

  /** blanks of one kind get different words, until the list runs out */
  export type NoRepeats = Expect<
    Invoke<
      typeof distinctWords,
      [template: "{noise} {noise} {noise} {noise} {noise}", seed: 1]
    >,
    "=",
    true
  >;
}
