// The bookshelf the demo loads: its schema, and its files (public/bookshelf/),
// served over HTTP or held in memory.
import type { JSONSchema7 } from "json-schema";
import { http, memory } from "./files.ts";

export type Person = { name: string; born: number; country: string };
export type Book = {
  title: string;
  year: number;
  author: Person;
  tags: string[];
};
export type Shelf = { name: string; curator: Person; books: Book[] };

/**
 * The shelf's schema. Its own `$ref`s (to `#/$defs/…`) are the library's, in the
 * schema; the data's are this demo's, between files.
 */
export const schema: JSONSchema7 = {
  type: "object",
  title: "Bookshelf",
  description: "One document, assembled from several files.",
  properties: {
    name: { type: "string", title: "Shelf" },
    curator: { $ref: "#/$defs/person", title: "Curator" },
    books: { type: "array", title: "Books", items: { $ref: "#/$defs/book" } },
  },
  required: ["name", "curator", "books"],
  $defs: {
    person: {
      type: "object",
      title: "Person",
      properties: {
        name: { type: "string", title: "Name" },
        born: { type: "integer", title: "Born" },
        country: { type: "string", title: "Country" },
      },
      required: ["name", "born", "country"],
    },
    book: {
      type: "object",
      title: "Book",
      properties: {
        title: { type: "string", title: "Title" },
        year: { type: "integer", title: "Year" },
        author: { $ref: "#/$defs/person", title: "Author" },
        tags: { type: "array", title: "Tags", items: { type: "string" } },
      },
      required: ["title", "year", "author", "tags"],
    },
  },
};

const root = "/public/bookshelf/";

const bundled = import.meta.glob<unknown>("/public/bookshelf/**/*.json", {
  eager: true,
  import: "default",
});

/** Every file of the shelf, by path from the shelf's folder: `people/ada.json`. */
export const files: Record<string, unknown> = Object.fromEntries(
  Object.entries(bundled).map(([path, value]) => [
    path.slice(root.length),
    value,
  ]),
);

/** The shelf's files as the dev server serves them, read with `fetch`. */
export const served = () => http("/bookshelf", Object.keys(files));

/** The shelf's files in memory, for tests: writes stay there. */
export const inMemory = () => memory(files);
