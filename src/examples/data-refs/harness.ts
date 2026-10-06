// Helpers for the namespace tests in refs.ts, which import this module only as
// a type: a filesystem of literal files, and edits made by path.
import { memory } from "./files.ts";
import { load, originOf, save } from "./refs.ts";

const plain = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (key, v) => (key === "$origin" ? undefined : v)),
  );

/** Where each object of a loaded document came from, by path: `file` or `file#pointer`. */
const origins = (
  value: unknown,
  path = "",
  into: Record<string, string> = {},
) => {
  if (value === null || typeof value !== "object") return into;
  const origin = originOf(value);
  if (origin)
    into[path] = origin.pointer
      ? `${origin.file}#${origin.pointer}`
      : origin.file;
  for (const [key, child] of Object.entries(value))
    if (key !== "$origin") origins(child, path ? `${path}.${key}` : key, into);
  return into;
};

/** `entry` loaded from `files`: the document without its origin marks, and the origins by path. */
export const loaded = async (files: Record<string, unknown>, entry: string) => {
  const { data } = await load(memory(files), entry);
  return { data: plain(data), from: origins(data) };
};

const set = (
  document: Record<string, unknown>,
  path: string,
  value: unknown,
) => {
  const keys = path.split(".");
  const parent = keys
    .slice(0, -1)
    .reduce<any>((node, key) => node[key], document);
  parent[keys[keys.length - 1]] = value;
};

/** `entry` loaded, edited (each `[path, value]` in turn) and saved: the report, and every file after. */
export const savedAfter = async (
  files: Record<string, unknown>,
  entry: string,
  edits: [path: string, value: unknown][],
) => {
  const fs = memory(files);
  const document = await load(fs, entry);
  for (const [path, value] of edits) set(document.data, path, value);
  const report = await save(fs, document, document.data);
  const after: Record<string, unknown> = {};
  for (const file of await fs.list()) after[file] = await fs.read(file);
  return { ...report, files: after };
};

/** The keys of `file`, in order, after `entry` is loaded, edited and saved. */
export const keysAfter = async (
  files: Record<string, unknown>,
  entry: string,
  edits: [path: string, value: unknown][],
  file: string,
) => Object.keys((await savedAfter(files, entry, edits)).files[file] as object);
