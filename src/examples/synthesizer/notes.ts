// Notes: names, frequencies, the on-screen keyboard's layout and the
// computer keyboard's mapping (the home row is the white keys, the row above
// it the black ones, as on most software instruments).
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";

const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

/** A MIDI note's name, in scientific pitch notation (60 is middle C, C4). */
export const noteName = (midi: number): string =>
  `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;

declare namespace noteName {
  export type Cases = Table<
    typeof noteName,
    [
      [args: [midi: 60], expected: "C4"],
      [args: [midi: 69], expected: "A4"],
      [args: [midi: 61], expected: "C♯4"],
      [args: [midi: 47], expected: "B2"],
    ]
  >;
}

/** A MIDI note's frequency in hertz, in equal temperament with A4 at 440 Hz. */
export const frequency = (midi: number): number =>
  440 * Math.pow(2, (midi - 69) / 12);

declare namespace frequency {
  export type Cases = Table<
    typeof frequency,
    [
      [args: [midi: 69], expected: 440],
      [args: [midi: 81], expected: 880],
      [args: [midi: 60], condition: ["~=", 1e-6], expected: 261.6255653005986],
    ]
  >;
}

/** Whether a note is a black key. */
export const isBlack = (midi: number): boolean =>
  [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

/** Each computer key, by the semitone it plays above the keyboard's lowest C. */
export const computerKeys = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
] as const;

/** The semitone above the lowest C a key plays, or undefined for a key that plays nothing. */
export const semitoneOf = (key: string): number | undefined => {
  const i = computerKeys.indexOf(
    key.toLowerCase() as (typeof computerKeys)[number],
  );
  return i < 0 ? undefined : i;
};

declare namespace semitoneOf {
  export type Cases = Table<
    typeof semitoneOf,
    [
      [args: [key: "a"], expected: 0],
      [args: [key: "w"], expected: 1],
      [args: [key: "K"], expected: 12],
      [args: [key: ";"], expected: 16],
      [args: [key: "q"], expected: undefined],
    ]
  >;
}

export type Key = {
  midi: number;
  name: string;
  black: boolean;
  /** the computer key that plays it, if any */
  letter?: string;
  /** for a white key, its place among the white keys; for a black one, the white key it sits after */
  column: number;
};

/** The keys from `lowest` up, `count` of them, each with its name, colour, letter and place. */
export const keyboard = (lowest: number, count: number): Key[] => {
  let column = -1;
  return Array.from({ length: count }, (_, i) => {
    const midi = lowest + i;
    const black = isBlack(midi);
    if (!black) column++;
    const letter = computerKeys[i];
    return {
      midi,
      name: noteName(midi),
      black,
      ...(letter ? { letter: letter.toUpperCase() } : {}),
      column,
    };
  });
};

declare namespace keyboard {
  /** C, C♯, D: two white keys, and the black one between them */
  export type ThreeKeys = Expect<
    Invoke<typeof keyboard, [lowest: 60, count: 3]>,
    "=",
    [
      { midi: 60; name: "C4"; black: false; letter: "A"; column: 0 },
      { midi: 61; name: "C♯4"; black: true; letter: "W"; column: 0 },
      { midi: 62; name: "D4"; black: false; letter: "S"; column: 1 },
    ]
  >;

  /** an octave and a third ends on E, the tenth white key, played with ";" */
  export type OctaveAndAThird = Expect<
    Invoke<typeof keyboard, [lowest: 48, count: 17]>[16],
    "=",
    { midi: 64; name: "E4"; black: false; letter: ";"; column: 9 }
  >;
}
