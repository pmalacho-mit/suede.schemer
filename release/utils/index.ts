import type { PrimitiveKind, Primitives } from "../types.js";
import type {
  Expect,
  Fixture,
  Invoke,
} from "../../suede.nests.schemer/dsl.import.meta.vitest.ts";

export const valid = {
  options: <Kind extends PrimitiveKind>(
    kind: Kind,
    options?: unknown[] | undefined,
  ): options is Primitives[Kind][] | undefined =>
    !options ||
    (Array.isArray(options) && options.every((opt) => typeof opt === kind)),

  default: <Kind extends PrimitiveKind>(
    kind: Kind,
    defaultValue: unknown,
  ): defaultValue is Primitives[Kind] | undefined =>
    defaultValue === undefined || typeof defaultValue === kind,
};

declare namespace valid.options {
  /** returns true when options is undefined */
  export type Undefined = [
    Expect<
      Invoke<typeof valid.options, [kind: "string", options: undefined]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "number", options: undefined]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "boolean", options: undefined]>,
      "=",
      true
    >,
  ];

  /** returns true for an empty array */
  export type EmptyArray = Expect<
    Invoke<typeof valid.options, [kind: "string", options: []]>,
    "=",
    true
  >;

  /** returns true when every element matches the kind */
  export type EveryElementMatches = [
    Expect<
      Invoke<typeof valid.options, [kind: "string", options: ["a", "b", "c"]]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "number", options: [1, 2, 3]]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "boolean", options: [true, false]]>,
      "=",
      true
    >,
  ];

  /** returns false when any element does not match the kind */
  export type AnyElementMismatches = [
    Expect<
      Invoke<typeof valid.options, [kind: "string", options: ["a", 1]]>,
      "=",
      false
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "number", options: [1, "two"]]>,
      "=",
      false
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "boolean", options: [true, "false"]]>,
      "=",
      false
    >,
  ];

  /** returns false when the value is not an array and not undefined */
  export type NotAnArray = [
    Expect<
      Invoke<
        typeof valid.options,
        [kind: "string", options: Fixture<any, "hello">]
      >,
      "=",
      false
    >,
    Expect<
      Invoke<typeof valid.options, [kind: "number", options: Fixture<any, 42>]>,
      "=",
      false
    >,
  ];
}

/** `valid.default`'s tests (`default` cannot name a namespace) */
declare namespace valid.defaultValue {
  /** returns true when defaultValue is undefined */
  export type Undefined = [
    Expect<
      Invoke<typeof valid.default, [kind: "string", defaultValue: undefined]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "number", defaultValue: undefined]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "boolean", defaultValue: undefined]>,
      "=",
      true
    >,
  ];

  /** returns true when defaultValue matches the kind */
  export type MatchesKind = [
    Expect<
      Invoke<typeof valid.default, [kind: "string", defaultValue: "hello"]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "number", defaultValue: 42]>,
      "=",
      true
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "boolean", defaultValue: false]>,
      "=",
      true
    >,
  ];

  /** returns false when defaultValue does not match the kind */
  export type MismatchesKind = [
    Expect<
      Invoke<typeof valid.default, [kind: "string", defaultValue: 42]>,
      "=",
      false
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "number", defaultValue: "hello"]>,
      "=",
      false
    >,
    Expect<
      Invoke<typeof valid.default, [kind: "boolean", defaultValue: 1]>,
      "=",
      false
    >,
  ];

  /** returns false for null (not undefined) */
  export type Null = Expect<
    Invoke<typeof valid.default, [kind: "string", defaultValue: null]>,
    "=",
    false
  >;
}

export type Replace<
  S extends string,
  From extends string,
  To extends string,
> = S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${Replace<R, From, To>}`
  : S;

export type JoinPath<
  Prefix extends string,
  Key extends string,
> = Prefix extends "" ? Key : `${Prefix}.${Key}`;

/** Standard union-to-intersection utility */
export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

/**
 * Like `Array.map`, but returns the original array if no element changed.
 *
 * @param arr The array to map over.
 * @param fn The mapping function.
 * @param equals Optional equality function to determine if an item changed. If not provided, strict equality (`!==`) is used.
 * @returns The mapped array, or the original array if no items changed.
 */
export const stableMap = <T>(
  arr: T[],
  fn: (item: T) => T,
  equals?: (a: T, b: T) => boolean,
): T[] => {
  let changed = false;
  const result = arr.map((item) => {
    const mapped = fn(item);
    if (equals ? !equals(mapped, item) : mapped !== item) changed = true;
    return mapped;
  });
  return changed ? result : arr;
};
