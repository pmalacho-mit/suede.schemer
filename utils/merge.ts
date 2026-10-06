import type { JSONSchema7 } from "json-schema";
import type { Context } from "../types.js";
import { asDef } from "./schema.js";
import { resolve } from "./refs.js";
import type {
  Construct,
  Expect,
  Invoke,
} from "../../suede.nests.schemer/dsl.import.meta.vitest.ts";

export const merge = (schema: JSONSchema7, ctx: Context): JSONSchema7 => {
  let result = { ...schema };

  // allOf: always merge everything together
  if (result.allOf) {
    for (const sub of result.allOf) {
      const resolved = resolve(asDef(sub), ctx);
      result = mergeSchemas(result, resolved);
    }
    delete result.allOf;
  }

  // anyOf with a single variant is just that variant
  if (result.anyOf?.length === 1) {
    const resolved = resolve(asDef(result.anyOf[0]), ctx);
    result = mergeSchemas(result, resolved);
    delete result.anyOf;
  }

  // oneOf with a single variant — same treatment
  if (result.oneOf?.length === 1) {
    const resolved = resolve(asDef(result.oneOf[0]), ctx);
    result = mergeSchemas(result, resolved);
    delete result.oneOf;
  }

  // if/then/else: merge "then" and "else" properties in so the
  // render tree shows all possible fields. Conditional visibility
  // is a renderer concern, not a schema-tree concern.
  if (result.then || result.else) {
    if (result.then)
      result = mergeSchemas(result, resolve(asDef(result.then), ctx));
    if (result.else)
      result = mergeSchemas(result, resolve(asDef(result.else), ctx));

    delete result.if;
    delete result.then;
    delete result.else;
  }

  return result;
};

declare namespace merge {
  type Ctx<Root extends JSONSchema7> = {
    rootSchema: Root;
    refStack: Construct<typeof Set<string>>;
    externalSchemas: Construct<typeof Map<string, JSONSchema7>>;
  };

  /** returns schema unchanged when no composition keywords are present */
  export type Unchanged = Expect<
    Invoke<typeof merge, [schema: { type: "string"; title: "Name" }, ctx: Ctx<{}>]>,
    "=",
    { type: "string"; title: "Name" }
  >;

  type AllOf = Invoke<
    typeof merge,
    [
      schema: {
        type: "object";
        allOf: [
          { properties: { a: { type: "string" } } },
          { properties: { b: { type: "number" } } },
        ];
      },
      ctx: Ctx<{}>,
    ]
  >;

  /** merges allOf sub-schemas */
  export type MergesAllOf = [
    Expect<AllOf["allOf"], "undefined">,
    Expect<AllOf["properties"], "=", { a: { type: "string" }; b: { type: "number" } }>,
  ];

  type SingleAnyOf = Invoke<typeof merge, [schema: { anyOf: [{ type: "string" }] }, ctx: Ctx<{}>]>;

  /** inlines a single-variant anyOf */
  export type InlinesSingleAnyOf = [
    Expect<SingleAnyOf["anyOf"], "undefined">,
    Expect<SingleAnyOf["type"], "=", "string">,
  ];

  /** does NOT inline a multi-variant anyOf */
  export type KeepsMultiAnyOf = Expect<
    Invoke<
      typeof merge,
      [schema: { anyOf: [{ type: "string" }, { type: "number" }] }, ctx: Ctx<{}>]
    >["anyOf"],
    "=",
    [{ type: "string" }, { type: "number" }]
  >;

  type SingleOneOf = Invoke<typeof merge, [schema: { oneOf: [{ type: "boolean" }] }, ctx: Ctx<{}>]>;

  /** inlines a single-variant oneOf */
  export type InlinesSingleOneOf = [
    Expect<SingleOneOf["oneOf"], "undefined">,
    Expect<SingleOneOf["type"], "=", "boolean">,
  ];

  /** does NOT inline a multi-variant oneOf */
  export type KeepsMultiOneOf = Expect<
    Invoke<
      typeof merge,
      [schema: { oneOf: [{ type: "string" }, { type: "number" }] }, ctx: Ctx<{}>]
    >["oneOf"],
    "defined"
  >;

  type Conditional = Invoke<
    typeof merge,
    [
      schema: {
        if: { properties: { flag: { type: "boolean" } } };
        then: { properties: { a: { type: "string" } } };
        else: { properties: { b: { type: "number" } } };
      },
      ctx: Ctx<{}>,
    ]
  >;

  /** merges then/else and removes if/then/else */
  export type MergesThenElse = [
    Expect<Conditional["if"], "undefined">,
    Expect<Conditional["then"], "undefined">,
    Expect<Conditional["else"], "undefined">,
    Expect<Conditional["properties"], "=", { a: { type: "string" }; b: { type: "number" } }>,
  ];

  /** resolves $ref inside allOf against rootSchema */
  export type ResolvesRefInAllOf = Expect<
    Invoke<
      typeof merge,
      [
        schema: { allOf: [{ $ref: "#/$defs/Name" }] },
        ctx: Ctx<{ $defs: { Name: { properties: { first: { type: "string" } } } } }>,
      ]
    >["properties"],
    "=",
    { first: { type: "string" } }
  >;
}

/**
 * Shallow-merge two schemas. Properties, required arrays, and
 * validation keywords all combine. Conflicting scalars (like
 * `type`) use the override (right-hand side).
 */
export const mergeSchemas = (
  base: JSONSchema7,
  override: JSONSchema7,
): JSONSchema7 => {
  const merged: JSONSchema7 = { ...base, ...override };

  // Deep-merge properties
  if (base.properties || override.properties)
    merged.properties = {
      ...(base.properties ?? {}),
      ...(override.properties ?? {}),
    };

  // Union required arrays
  if (base.required || override.required)
    merged.required = [
      ...new Set([...(base.required ?? []), ...(override.required ?? [])]),
    ];

  if (base.minimum != null && override.minimum != null)
    merged.minimum = Math.max(base.minimum, override.minimum);

  if (base.maximum != null && override.maximum != null)
    merged.maximum = Math.min(base.maximum, override.maximum);

  if (base.minLength != null && override.minLength != null)
    merged.minLength = Math.max(base.minLength, override.minLength);

  if (base.maxLength != null && override.maxLength != null)
    merged.maxLength = Math.min(base.maxLength, override.maxLength);

  return merged;
};

declare namespace mergeSchemas {
  /** produces a shallow merge of two schemas */
  export type ShallowMerge = Expect<
    Invoke<typeof mergeSchemas, [base: { type: "object" }, override: { title: "Foo" }]>,
    "matches",
    { type: "object"; title: "Foo" }
  >;

  /** override wins for conflicting scalar fields */
  export type OverrideWins = Expect<
    Invoke<typeof mergeSchemas, [base: { type: "string" }, override: { type: "number" }]>["type"],
    "=",
    "number"
  >;

  /** deep-merges properties */
  export type DeepMergesProperties = Expect<
    Invoke<
      typeof mergeSchemas,
      [
        base: { properties: { a: { type: "string" } } },
        override: { properties: { b: { type: "number" } } },
      ]
    >["properties"],
    "=",
    { a: { type: "string" }; b: { type: "number" } }
  >;

  /** override properties win over base properties for the same key */
  export type OverridePropertyWins = Expect<
    Invoke<
      typeof mergeSchemas,
      [
        base: { properties: { a: { type: "string" } } },
        override: { properties: { a: { type: "number" } } },
      ]
    >["properties"],
    "=",
    { a: { type: "number" } }
  >;

  /** unions required arrays and deduplicates */
  export type UnionsRequired = Expect<
    Invoke<typeof mergeSchemas, [base: { required: ["a", "b"] }, override: { required: ["b", "c"] }]>["required"],
    "=",
    ["a", "b", "c"]
  >;

  /** picks the higher minimum */
  export type HigherMinimum = [
    Expect<Invoke<typeof mergeSchemas, [base: { minimum: 1 }, override: { minimum: 5 }]>["minimum"], "=", 5>,
    Expect<Invoke<typeof mergeSchemas, [base: { minimum: 10 }, override: { minimum: 3 }]>["minimum"], "=", 10>,
  ];

  /** picks the lower maximum */
  export type LowerMaximum = [
    Expect<Invoke<typeof mergeSchemas, [base: { maximum: 10 }, override: { maximum: 5 }]>["maximum"], "=", 5>,
    Expect<Invoke<typeof mergeSchemas, [base: { maximum: 3 }, override: { maximum: 100 }]>["maximum"], "=", 3>,
  ];

  /** picks the higher minLength */
  export type HigherMinLength = Expect<
    Invoke<typeof mergeSchemas, [base: { minLength: 2 }, override: { minLength: 8 }]>["minLength"],
    "=",
    8
  >;

  /** picks the lower maxLength */
  export type LowerMaxLength = Expect<
    Invoke<typeof mergeSchemas, [base: { maxLength: 20 }, override: { maxLength: 10 }]>["maxLength"],
    "=",
    10
  >;

  /** leaves minimum/maximum alone when only one side has them */
  export type OneSidedBounds = [
    Expect<Invoke<typeof mergeSchemas, [base: { minimum: 1 }, override: {}]>["minimum"], "=", 1>,
    Expect<Invoke<typeof mergeSchemas, [base: {}, override: { maximum: 99 }]>["maximum"], "=", 99>,
  ];
}
