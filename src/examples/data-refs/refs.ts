// `$ref` in data: a document can stand for another file (or a part of one) with
// `{ "$ref": "people/ada.json" }`, as JSON Schema does for schemas. `load`
// expands every reference into one document a form can edit; `save` writes
// each edited part back to the file it came from.
import type {
  Expect,
  Invoke,
  Throws,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import { at, join, replaceAt, type FileSystem } from "./files.ts";
import type { keysAfter, loaded, savedAfter } from "./harness.ts";

/** A reference: an object whose only key is `$ref`, `<path>[#<JSON pointer>]` relative to its file. */
export type Reference = { $ref: string };

export const isReference = (value: unknown): value is Reference =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === 1 &&
  typeof (value as Reference).$ref === "string";

/**
 * Where an object of the loaded document came from: the file and the pointer
 * into it, and the `$ref` that brought it, as written. Kept on the object
 * itself, so it follows the object wherever an edit moves it (an array item
 * removed or reordered) and leaves with it when it is deleted.
 */
export type Origin = { file: string; pointer: string; ref?: string };

export const ORIGIN = "$origin";

export type Loaded = {
  entry: string;
  /** the document, every reference expanded, each object from a file marked with `$origin` */
  data: Record<string, unknown>;
  /** every file read, as stored */
  files: Map<string, unknown>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** The origin of an object of a loaded document, if it came from a file. */
export const originOf = (value: unknown): Origin | undefined =>
  isObject(value) ? (value[ORIGIN] as Origin | undefined) : undefined;

/**
 * Reads `entry` from `fs`, expanding every reference, each relative to the
 * file it is written in. A reference must name an object; a chain of
 * references back to where it started throws.
 */
export const load = async (fs: FileSystem, entry: string): Promise<Loaded> => {
  const files = new Map<string, unknown>();
  const read = async (file: string) => {
    if (!files.has(file)) files.set(file, await fs.read(file));
    return files.get(file);
  };

  const expand = async (
    value: unknown,
    file: string,
    chain: string[],
    origin?: Origin,
  ): Promise<unknown> => {
    if (Array.isArray(value))
      return Promise.all(value.map((item) => expand(item, file, chain)));
    if (!isObject(value)) return value;
    if (isReference(value)) {
      const [target, fragment = ""] = value.$ref.split("#");
      const into = target ? join(file, target) : file;
      const pointer = decodeURIComponent(fragment);
      const key = `${into}#${pointer}`;
      if (chain.includes(key))
        throw new Error(`circular $ref: ${[...chain, key].join(" → ")}`);
      const referenced = at(await read(into), pointer);
      if (!isObject(referenced))
        throw new Error(`$ref ${value.$ref} in ${file} names no object`);
      // a reference to a reference keeps the first $ref, as its parent wrote it
      return expand(referenced, into, [...chain, key], {
        file: into,
        pointer,
        ref: origin?.ref ?? value.$ref,
      });
    }
    const expanded: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value))
      expanded[key] = await expand(child, file, chain);
    if (origin) expanded[ORIGIN] = origin;
    return expanded;
  };

  const data = (await expand(await read(entry), entry, [`${entry}#`], {
    file: entry,
    pointer: "",
  })) as Record<string, unknown>;
  return { entry, data, files };
};

declare namespace load {
  type Shelf = {
    "shelf.json": {
      curator: { $ref: "people/ada.json" };
      books: [{ $ref: "books/notes.json" }];
    };
    "books/notes.json": {
      title: "Notes";
      author: { $ref: "../people/ada.json" };
    };
    "people/ada.json": { name: "Ada" };
  };

  /** expands references into one document, each relative to its own file */
  export type Expands = Expect<
    Invoke<typeof loaded, [files: Shelf, entry: "shelf.json"]>["data"],
    "=",
    {
      curator: { name: "Ada" };
      books: [{ title: "Notes"; author: { name: "Ada" } }];
    }
  >;

  /** records which file each part came from */
  export type Origins = Expect<
    Invoke<typeof loaded, [files: Shelf, entry: "shelf.json"]>["from"],
    "=",
    {
      "": "shelf.json";
      curator: "people/ada.json";
      "books.0": "books/notes.json";
      "books.0.author": "people/ada.json";
    }
  >;

  /** a fragment points into a file */
  export type Pointer = Expect<
    Invoke<
      typeof loaded,
      [
        files: {
          "shelf.json": { pick: { $ref: "catalog.json#/books/1" } };
          "catalog.json": { books: [{ title: "First" }, { title: "Second" }] };
        },
        entry: "shelf.json",
      ]
    >,
    "matches",
    {
      data: { pick: { title: "Second" } };
      from: { pick: "catalog.json#/books/1" };
    }
  >;

  /** references that lead back to themselves throw */
  export type Circular = Throws<
    Invoke<
      typeof loaded,
      [
        files: {
          "a.json": { next: { $ref: "b.json" } };
          "b.json": { next: { $ref: "a.json" } };
        },
        entry: "a.json",
      ]
    >,
    "circular $ref"
  >;

  /** a reference must name an object */
  export type NotAnObject = Throws<
    Invoke<
      typeof loaded,
      [
        files: {
          "a.json": { n: { $ref: "b.json#/count" } };
          "b.json": { count: 3 };
        },
        entry: "a.json",
      ]
    >,
    "names no object"
  >;
}

/** How a save went: the files written, and what could not be written. */
export type Saved = {
  written: string[];
  /** a file used in more than one place, edited differently in each */
  conflicts: { file: string; pointer: string }[];
};

/** `value` as its file stores it: no origins, and what came from other files a `$ref` again. */
const stored = (value: unknown, top = true): unknown => {
  if (Array.isArray(value)) return value.map((item) => stored(item, false));
  if (!isObject(value)) return value;
  const origin = originOf(value);
  if (origin && !top && origin.ref) return { $ref: origin.ref };
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== ORIGIN)
      .map(([key, child]) => [key, stored(child, false)]),
  );
};

const canonical = (value: unknown): string =>
  JSON.stringify(value, (_, v) =>
    isObject(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
        )
      : v,
  );

/**
 * Writes `data` (a document `load` made, since edited) back to the files it
 * came from: each object marked with an origin to its file, everything else
 * where it is. A file used in several places is written from the copy that
 * changed; copies changed differently are a conflict, and that file is left as
 * it was. Files nothing changed are not written.
 */
export const save = async (
  fs: FileSystem,
  { files }: Loaded,
  data: Record<string, unknown>,
): Promise<Saved> => {
  const copies = new Map<string, { origin: Origin; values: unknown[] }>();
  const collect = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(collect);
    if (!isObject(value)) return;
    const origin = originOf(value);
    if (origin) {
      const key = `${origin.file}#${origin.pointer}`;
      if (!copies.has(key)) copies.set(key, { origin, values: [] });
      copies.get(key)!.values.push(stored(value));
    }
    Object.values(value).forEach(collect);
  };
  collect(data);

  const next = new Map<string, unknown>();
  const conflicts: Saved["conflicts"] = [];
  for (const { origin, values } of copies.values()) {
    const { file, pointer } = origin;
    const original = canonical(at(files.get(file), pointer));
    // compared in a canonical form (keys sorted); written as edited, keys in their order
    const changed = new Map<string, unknown>();
    for (const value of values) {
      const key = canonical(value);
      if (key !== original && !changed.has(key)) changed.set(key, value);
    }
    if (changed.size === 0) continue;
    if (changed.size > 1) {
      conflicts.push({ file, pointer });
      continue;
    }
    const [value] = changed.values();
    next.set(
      file,
      replaceAt(next.get(file) ?? files.get(file), pointer, value),
    );
  }

  const written: string[] = [];
  for (const [file, content] of next) {
    if (conflicts.some((c) => c.file === file)) continue;
    await fs.write(file, content);
    written.push(file);
  }
  return { written: written.sort(), conflicts };
};

declare namespace save {
  type Shelf = {
    "shelf.json": {
      curator: { $ref: "people/ada.json" };
      books: [{ $ref: "books/notes.json" }];
    };
    "books/notes.json": {
      title: "Notes";
      author: { $ref: "../people/ada.json" };
    };
    "people/ada.json": { name: "Ada" };
  };

  /** an edit is written to the file it came from, and nowhere else */
  export type ToItsFile = Expect<
    Invoke<
      typeof savedAfter,
      [
        files: Shelf,
        entry: "shelf.json",
        edits: [["books.0.title", "Notes, revised"]],
      ]
    >,
    "matches",
    {
      written: ["books/notes.json"];
      files: {
        "books/notes.json": {
          title: "Notes, revised";
          author: { $ref: "../people/ada.json" };
        };
        "shelf.json": { curator: { $ref: "people/ada.json" } };
      };
    }
  >;

  /** a file used twice is written from the copy that changed */
  export type SharedFile = Expect<
    Invoke<
      typeof savedAfter,
      [
        files: Shelf,
        entry: "shelf.json",
        edits: [["curator.name", "Ada Lovelace"]],
      ]
    >,
    "matches",
    {
      written: ["people/ada.json"];
      conflicts: [];
      files: { "people/ada.json": { name: "Ada Lovelace" } };
    }
  >;

  /** copies of one file changed differently are a conflict, and nothing is written to it */
  export type Conflict = Expect<
    Invoke<
      typeof savedAfter,
      [
        files: Shelf,
        entry: "shelf.json",
        edits: [
          ["curator.name", "Ada Lovelace"],
          ["books.0.author.name", "Augusta Ada King"],
        ],
      ]
    >,
    "matches",
    {
      written: [];
      conflicts: [{ file: "people/ada.json"; pointer: "" }];
      files: { "people/ada.json": { name: "Ada" } };
    }
  >;

  /** an object added in the form is kept inline, in the file of what holds it */
  export type NewStaysInline = Expect<
    Invoke<
      typeof savedAfter,
      [
        files: Shelf,
        entry: "shelf.json",
        edits: [["books.1", { title: "New"; author: { name: "Grace" } }]],
      ]
    >,
    "matches",
    {
      written: ["shelf.json"];
      files: {
        "shelf.json": {
          books: [
            { $ref: "books/notes.json" },
            { title: "New"; author: { name: "Grace" } },
          ];
        };
      };
    }
  >;

  /** a written file keeps its keys in their order */
  export type KeyOrder = Expect<
    Invoke<
      typeof keysAfter,
      [
        files: Shelf,
        entry: "shelf.json",
        edits: [["books.0.title", "Notes, revised"]],
        file: "books/notes.json",
      ]
    >,
    "=",
    ["title", "author"]
  >;

  /** nothing edited, nothing written */
  export type Untouched = Expect<
    Invoke<
      typeof savedAfter,
      [files: Shelf, entry: "shelf.json", edits: []]
    >["written"],
    "=",
    []
  >;
}
