// A filesystem-like interface for JSON documents, and three of them: in
// memory, over HTTP, and an overlay that keeps writes in memory over another.
import type {
  Expect,
  Invoke,
  Throws,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";

/** JSON documents by path: `people/ada.json`, relative to the system's root, no leading slash. */
export interface FileSystem {
  /** The parsed document at `path`; rejects if there is none. */
  read(path: string): Promise<unknown>;
  /** Replaces (or creates) the document at `path`. */
  write(path: string, value: unknown): Promise<void>;
  /** Every document's path, sorted. */
  list(): Promise<string[]>;
}

export class NotFound extends Error {
  constructor(readonly path: string) {
    super(`no file at ${path}`);
  }
}

const copy = <T>(value: T): T => structuredClone(value);

/** Documents held in memory: reads and writes copy, so no caller shares a document. */
export const memory = (files: Record<string, unknown> = {}): FileSystem => {
  const store = new Map(Object.entries(files).map(([p, v]) => [p, copy(v)]));
  return {
    read: async (path) => {
      if (!store.has(path)) throw new NotFound(path);
      return copy(store.get(path));
    },
    write: async (path, value) => void store.set(path, copy(value)),
    list: async () => [...store.keys()].sort(),
  };
};

/**
 * Documents served over HTTP under `base` (a dev server's `public/` folder,
 * say). HTTP cannot list a folder, so the paths are given; nor write, so
 * writing rejects (lay an `overlay` over it).
 */
export const http = (base: string, paths: string[]): FileSystem => ({
  read: async (path) => {
    const response = await fetch(`${base.replace(/\/$/, "")}/${path}`);
    if (!response.ok) throw new NotFound(path);
    return response.json();
  },
  write: async (path) => {
    throw new Error(`cannot write ${path} over HTTP`);
  },
  list: async () => [...paths].sort(),
});

/** Another system, with writes kept in memory on top of it: `edited` names what was written. */
export const overlay = (lower: FileSystem) => {
  const upper = memory();
  const edited = new Set<string>();
  return {
    edited,
    read: (path: string) =>
      edited.has(path) ? upper.read(path) : lower.read(path),
    write: async (path: string, value: unknown) => {
      await upper.write(path, value);
      edited.add(path);
    },
    list: async () => [...new Set([...(await lower.list()), ...edited])].sort(),
    /** Forgets every write. */
    reset: () => edited.clear(),
  } satisfies FileSystem & Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** The folder a path is in: `books/notes.json` → `books`. */
export const dirname = (path: string) =>
  path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

declare namespace dirname {
  /** the folder of a nested file */
  export type Nested = Expect<
    Invoke<typeof dirname, [path: "a/b/c.json"]>,
    "=",
    "a/b"
  >;
  /** a file at the root is in the root */
  export type AtRoot = Expect<
    Invoke<typeof dirname, [path: "c.json"]>,
    "=",
    ""
  >;
}

/**
 * Where `target` points from the file `from`: relative to its folder, or to
 * the root with a leading slash. `..` climbs; climbing past the root throws.
 */
export const join = (from: string, target: string) => {
  const parts = target.startsWith("/")
    ? []
    : dirname(from).split("/").filter(Boolean);
  for (const segment of target.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (!parts.length)
        throw new Error(`${target} climbs out of the root from ${from}`);
      parts.pop();
    } else parts.push(segment);
  }
  return parts.join("/");
};

declare namespace join {
  /** a sibling */
  export type Sibling = Expect<
    Invoke<typeof join, [from: "books/notes.json", target: "passages.json"]>,
    "=",
    "books/passages.json"
  >;
  /** up a folder and into another */
  export type Climbs = Expect<
    Invoke<
      typeof join,
      [from: "books/notes.json", target: "../people/ada.json"]
    >,
    "=",
    "people/ada.json"
  >;
  /** a leading slash starts from the root */
  export type FromRoot = Expect<
    Invoke<typeof join, [from: "books/notes.json", target: "/people/ada.json"]>,
    "=",
    "people/ada.json"
  >;
  /** `.` and empty segments are skipped */
  export type Dots = Expect<
    Invoke<typeof join, [from: "shelf.json", target: "./people//ada.json"]>,
    "=",
    "people/ada.json"
  >;
  /** climbing out of the root throws */
  export type OutOfRoot = Throws<
    Invoke<typeof join, [from: "shelf.json", target: "../secret.json"]>,
    "climbs out of the root"
  >;
}

// ---------------------------------------------------------------------------
// JSON Pointers (RFC 6901): "" is the whole document, "/books/0" a part of it
// ---------------------------------------------------------------------------

const tokens = (pointer: string) =>
  pointer === ""
    ? []
    : pointer
        .replace(/^\//, "")
        .split("/")
        .map((t) => t.replace(/~1/g, "/").replace(/~0/g, "~"));

/** The part of `document` that `pointer` names; throws if there is none. */
export const at = (document: unknown, pointer: string): unknown =>
  tokens(pointer).reduce<unknown>((value, token) => {
    if (value === null || typeof value !== "object" || !(token in value))
      throw new Error(`nothing at ${pointer}`);
    return (value as Record<string, unknown>)[token];
  }, document);

declare namespace at {
  type Catalog = { books: [{ title: "Machinery" }]; "a/b": 1 };

  /** the empty pointer is the whole document */
  export type Whole = Expect<
    Invoke<typeof at, [document: Catalog, pointer: ""]>,
    "=",
    Catalog
  >;
  /** a pointer walks objects and arrays */
  export type Walks = Expect<
    Invoke<typeof at, [document: Catalog, pointer: "/books/0/title"]>,
    "=",
    "Machinery"
  >;
  /** ~1 stands for a slash in a key */
  export type Escapes = Expect<
    Invoke<typeof at, [document: Catalog, pointer: "/a~1b"]>,
    "=",
    1
  >;
  /** a pointer to nothing throws */
  export type Missing = Throws<
    Invoke<typeof at, [document: Catalog, pointer: "/books/3"]>,
    "nothing at /books/3"
  >;
}

/** A copy of `document` with the part at `pointer` replaced by `value`. */
export const replaceAt = (
  document: unknown,
  pointer: string,
  value: unknown,
): unknown => {
  const path = tokens(pointer);
  if (!path.length) return copy(value);
  const result = copy(document) as Record<string, unknown>;
  const parent = path
    .slice(0, -1)
    .reduce<
      Record<string, unknown>
    >((node, token) => node[token] as Record<string, unknown>, result);
  at(result, pointer); // throws if the place does not exist
  parent[path[path.length - 1]] = copy(value);
  return result;
};

declare namespace replaceAt {
  /** replaces one part and keeps the rest */
  export type One = Expect<
    Invoke<
      typeof replaceAt,
      [
        document: { books: [{ title: "Old" }, { title: "Kept" }] },
        pointer: "/books/0",
        value: { title: "New" },
      ]
    >,
    "=",
    { books: [{ title: "New" }, { title: "Kept" }] }
  >;
  /** the empty pointer replaces everything */
  export type Whole = Expect<
    Invoke<
      typeof replaceAt,
      [document: { a: 1 }, pointer: "", value: { b: 2 }]
    >,
    "=",
    { b: 2 }
  >;
}
