// Helpers for the namespace tests in tales.ts, which imports this module only
// as a type: what a literal cannot say (streaming into a model, comparing
// every beat of a reading).
import { Model, root } from "../../../release/index.ts";
import { stories } from "./stories.ts";
import {
  clip,
  fill,
  length,
  parse,
  recital,
  schemaFor,
  surprise,
  taleOf,
  tell,
  type Answers,
  type Tale,
} from "./tales.ts";

/** Whether a story asks once for a word it uses more than once. */
export const reusesABlank = (tale: Tale) =>
  tale.blanks.some((blank) => blank.uses > 1);

/** The `shown` of every beat of a reading. */
export const stepsOf = (
  template: string,
  answers: Partial<Answers>,
  step: number,
) => recital(parse(template), answers, step).map(({ shown }) => shown);

/** Whether, by a reading's end, every word has been said in full and the whole story shown. */
export const saidInTheEnd = (id: string, seed: number) => {
  const tale = taleOf(id);
  const answers = surprise(tale, seed);
  const beats = recital(tale, answers);
  const said = Object.assign({}, ...beats.map((beat) => beat.said));
  return (
    beats.at(-1)?.shown === length(fill(tale, answers)) &&
    tale.blanks.every((blank) => said[blank.key] === answers[blank.key])
  );
};

/**
 * Streams a reading into a model in "stream" mode, as the app does, and checks
 * that at every beat what it shows is the finished story cut to that length.
 */
export const readsTheSameAsItIsTold = (
  id: string,
  seed: number,
  step: number,
) => {
  const tale = taleOf(id);
  const answers = { story: id, ...surprise(tale, seed) };
  const finished = tell(tale, answers);
  const aloud = new Model("stream", { story: id } as Answers);
  return recital(tale, answers, step).every(({ shown, said }) => {
    aloud.applyPartial(said);
    const read = clip(fill(tale, aloud.data as Answers), shown)
      .map((segments) => segments.map(({ text }) => text).join(""))
      .join("");
    return read === finished.replaceAll("\n\n", "").slice(0, shown);
  });
};

/** Whether "Surprise me" gives each blank of a template a different word. */
export const distinctWords = (template: string, seed: number) => {
  const words = Object.values(surprise(parse(template), seed));
  return new Set(words).size === words.length;
};

/** The fields the library draws for a story's variant, one line each. */
export const drawnFields = async (id: string) => {
  const tree = await root(schemaFor(stories));
  if (tree.kind !== "oneOf") throw new Error(`expected a oneOf: ${tree.kind}`);
  const variant = tree.variants.find(
    (v) =>
      v.kind === "object" &&
      v.children.some((c) => c.kind === "string" && c.const === id),
  );
  if (variant?.kind !== "object") throw new Error(`no variant for ${id}`);
  return variant.children.map((child) => {
    const line = `${child.path}: ${child.kind}`;
    if (child.kind === "string" && child.const !== undefined)
      return `${line} = ${child.const}`;
    if (child.kind === "string" && child.options)
      return `${line} of ${child.options.length}`;
    if (child.kind === "number") return `${line} ${child.min}–${child.max}`;
    return line;
  });
};
