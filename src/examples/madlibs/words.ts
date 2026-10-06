import type {
  Expect,
  Invoke,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";

/**
 * The parts of speech a story can ask for: how a blank is labelled, the hint
 * under it, and the small word lists "Surprise me" draws from.
 */

/** How the revealed story colours a word, and the badge beside its input. */
export type Family = "noun" | "verb" | "describer" | "number" | "wildcard";

type Common = {
  /** the field's title: "Adjective" */
  label: string;
  /** the hint under it: "describes a thing: fuzzy, loud, …" */
  hint: string;
  /** a short name for the badge and the hover tag: "adjective" */
  short: string;
  family: Family;
};

/** A blank you type a word into; `words` is what "Surprise me" picks from. */
export type WordKind = Common & { type: "word"; words: readonly string[] };
/** A blank you pick from a list (a JSON Schema `enum`): funnier when the list is the joke. */
export type ChoiceKind = Common & {
  type: "choice";
  options: readonly string[];
};
/** A whole number between `min` and `max` (a JSON Schema `integer`). */
export type NumberKind = Common & {
  type: "number";
  min: number;
  max: number;
  /** the numbers "Surprise me" likes best */
  favourites: readonly number[];
};

export type Kind = WordKind | ChoiceKind | NumberKind;

export const kinds = {
  noun: {
    type: "word",
    label: "Noun",
    short: "noun",
    family: "noun",
    hint: "a person, place or thing: spatula, lighthouse, aunt…",
    words: [
      "spatula",
      "trombone",
      "lighthouse",
      "rubber duck",
      "toaster",
      "cactus",
      "accordion",
      "lawn gnome",
      "waffle iron",
      "submarine",
      "doorknob",
      "tuba",
    ],
  },
  pluralNoun: {
    type: "word",
    label: "Plural noun",
    short: "plural noun",
    family: "noun",
    hint: "more than one thing: socks, pigeons, tax returns…",
    words: [
      "socks",
      "pigeons",
      "tax returns",
      "meatballs",
      "kazoos",
      "garden hoses",
      "rubber bands",
      "lawyers",
      "marshmallows",
      "traffic cones",
      "bagpipes",
      "eyebrows",
    ],
  },
  animal: {
    type: "word",
    label: "Animal",
    short: "animal",
    family: "noun",
    hint: "any creature: aardvark, flamingo, hamster…",
    words: [
      "aardvark",
      "flamingo",
      "hamster",
      "walrus",
      "capybara",
      "pelican",
      "narwhal",
      "goat",
      "axolotl",
      "wombat",
      "llama",
      "badger",
    ],
  },
  food: {
    type: "word",
    label: "Food",
    short: "food",
    family: "noun",
    hint: "something edible, or nearly: lasagne, a pickle, cold beans…",
    words: [
      "lasagne",
      "a pickle",
      "cold beans",
      "spaghetti",
      "fish fingers",
      "a turnip",
      "custard",
      "sardines",
      "jelly",
      "a cheese wheel",
      "porridge",
      "a burrito",
    ],
  },
  place: {
    type: "word",
    label: "Place",
    short: "place",
    family: "noun",
    hint: "somewhere: Belgium, the dentist's, a bouncy castle…",
    words: [
      "Belgium",
      "the dentist's",
      "a bouncy castle",
      "the moon",
      "Ikea",
      "a car wash",
      "Antarctica",
      "the post office",
      "a submarine",
      "Narnia",
      "the laundromat",
      "Saskatchewan",
    ],
  },
  bodyPart: {
    type: "word",
    label: "Body part",
    short: "body part",
    family: "noun",
    hint: "a piece of you: elbow, nostril, kneecap…",
    words: [
      "elbow",
      "nostril",
      "kneecap",
      "eyebrow",
      "earlobe",
      "big toe",
      "belly button",
      "armpit",
      "chin",
      "pinky finger",
      "shin",
      "left ear",
    ],
  },
  celebrity: {
    type: "word",
    label: "Celebrity",
    short: "celebrity",
    family: "noun",
    hint: "someone famous: real, historical or made up",
    words: [
      "Cleopatra",
      "Elvis",
      "Beyoncé",
      "Napoleon",
      "Shakespeare",
      "Dolly Parton",
      "Abraham Lincoln",
      "Gandalf",
      "Taylor Swift",
      "Albert Einstein",
      "the Queen of Hearts",
      "Mr. Bean",
    ],
  },
  liquid: {
    type: "word",
    label: "Liquid",
    short: "liquid",
    family: "noun",
    hint: "anything that pours: gravy, lemonade, pond water…",
    words: [
      "gravy",
      "lemonade",
      "pond water",
      "maple syrup",
      "pickle juice",
      "motor oil",
      "warm milk",
      "hot sauce",
      "bubble bath",
      "custard",
    ],
  },
  verb: {
    type: "word",
    label: "Verb",
    short: "verb",
    family: "verb",
    hint: "an action word: juggle, whisper, sneeze…",
    words: [
      "juggle",
      "whisper",
      "sneeze",
      "yodel",
      "wobble",
      "tiptoe",
      "gargle",
      "moonwalk",
      "hiccup",
      "cartwheel",
      "waddle",
      "somersault",
    ],
  },
  verbIng: {
    type: "word",
    label: "Verb ending in -ing",
    short: "verb -ing",
    family: "verb",
    hint: "something happening: wobbling, yodelling, gargling…",
    words: [
      "wobbling",
      "yodelling",
      "gargling",
      "breakdancing",
      "sneezing",
      "tap-dancing",
      "hiccupping",
      "knitting",
      "moonwalking",
      "giggling",
      "sulking",
      "polka-dancing",
    ],
  },
  verbPast: {
    type: "word",
    label: "Verb, past tense",
    short: "past-tense verb",
    family: "verb",
    hint: "it already happened: tripped, sang, exploded…",
    words: [
      "tripped",
      "sang",
      "exploded",
      "sneezed",
      "fainted",
      "yodelled",
      "napped",
      "juggled",
      "hiccupped",
      "tangoed",
      "wept",
      "burped",
    ],
  },
  adjective: {
    type: "word",
    label: "Adjective",
    short: "adjective",
    family: "describer",
    hint: "describes a thing: fuzzy, loud, suspicious…",
    words: [
      "fuzzy",
      "loud",
      "suspicious",
      "soggy",
      "majestic",
      "sticky",
      "grumpy",
      "enormous",
      "wobbly",
      "sparkly",
      "smelly",
      "dramatic",
    ],
  },
  adverb: {
    type: "word",
    label: "Adverb",
    short: "adverb",
    family: "describer",
    hint: "describes how: sneakily, loudly, sideways…",
    words: [
      "sneakily",
      "loudly",
      "sideways",
      "gracefully",
      "suspiciously",
      "politely",
      "furiously",
      "backwards",
      "lovingly",
      "noisily",
      "majestically",
      "reluctantly",
    ],
  },
  colour: {
    type: "choice",
    label: "Colour",
    short: "colour",
    family: "describer",
    hint: "pick the least sensible one",
    options: [
      "beige",
      "chartreuse",
      "glow-in-the-dark",
      "invisible",
      "mauve",
      "plaid",
      "puce",
      "tartan",
      "ultraviolet",
    ],
  },
  number: {
    type: "number",
    label: "Number",
    short: "number",
    family: "number",
    hint: "a whole number from 2 to 999",
    min: 2,
    max: 999,
    favourites: [3, 7, 12, 17, 42, 99, 101, 250, 404, 999],
  },
  exclamation: {
    type: "word",
    label: "Exclamation",
    short: "exclamation",
    family: "wildcard",
    hint: "something you'd shout: Yikes!, Great Scott!, Bananas!",
    words: [
      "Yikes!",
      "Great Scott!",
      "Bananas!",
      "Holy guacamole!",
      "Fiddlesticks!",
      "Zoinks!",
      "Good grief!",
      "Cowabunga!",
      "Oh, crumbs!",
      "Jumping jellyfish!",
    ],
  },
  noise: {
    type: "word",
    label: "Silly noise",
    short: "noise",
    family: "wildcard",
    hint: "a sound effect: boing, splat, honk…",
    words: [
      "boing",
      "splat",
      "honk",
      "kerplunk",
      "fwoosh",
      "squelch",
      "blorp",
      "ka-ching",
      "thwack",
      "toot",
    ],
  },
} as const satisfies Record<string, Kind>;

export type KindName = keyof typeof kinds;

/** Whether `name` is a part of speech the stories can ask for. */
export const isKind = (name: string): name is KindName => name in kinds;

declare namespace isKind {
  export type Known = Expect<
    Invoke<typeof isKind, [name: "adjective"]>,
    "truthy"
  >;
  export type Unknown = Expect<
    Invoke<typeof isKind, [name: "gerund"]>,
    "falsy"
  >;
}

/** The words "Surprise me" may pick for a kind of blank. */
export const pool = (name: KindName): readonly (string | number)[] => {
  const kind: Kind = kinds[name];
  switch (kind.type) {
    case "word":
      return kind.words;
    case "choice":
      return kind.options;
    case "number":
      return kind.favourites;
  }
};

declare namespace pool {
  /** a typed blank draws from its word list */
  export type Words = Expect<
    Invoke<typeof pool, [name: "noise"]>,
    "includes",
    "kerplunk"
  >;
  /** a choice draws from its options, so a surprise is always a valid choice */
  export type Choices = Expect<
    Invoke<typeof pool, [name: "colour"]>,
    "includes",
    "plaid"
  >;
  /** a number draws from its favourites */
  export type Numbers = Expect<
    Invoke<typeof pool, [name: "number"]>,
    "includes",
    42
  >;
}
