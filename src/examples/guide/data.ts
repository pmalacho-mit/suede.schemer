// Step 1: the data. Start from what you want someone to edit, as a TypeScript
// type, and one value of it. Here: a patch for a small synthesizer.

export type Wave = "sine" | "square" | "sawtooth" | "triangle";

export type Patch = {
  name: string;
  wave: Wave;
  octave: number;
  volume: number;
  envelope: { attack: number; release: number };
  harmonics: { ratio: number; level: number }[];
  filter:
    | { type: "off" }
    | { type: "lowpass"; cutoff: number }
    | { type: "highpass"; cutoff: number };
};

export const initial: Patch = {
  name: "Glass bell",
  wave: "sine",
  octave: 0,
  volume: 0.6,
  envelope: { attack: 0.01, release: 1.4 },
  harmonics: [
    { ratio: 2, level: 0.4 },
    { ratio: 3.5, level: 0.15 },
  ],
  filter: { type: "lowpass", cutoff: 4000 },
};
