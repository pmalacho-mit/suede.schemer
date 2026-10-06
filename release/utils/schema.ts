import type {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from "json-schema";
import type {
  Expect,
  Fixture,
  Invoke,
} from "../../suede.nests.schemer/dsl.import.meta.vitest.ts";

export const isSchema = (
  v: JSONSchema7Definition | undefined | null,
): v is JSONSchema7 => typeof v === "object" && v !== null;

declare namespace isSchema {
  /** returns true for plain objects */
  export type PlainObjects = [
    Expect<Invoke<typeof isSchema, [v: { type: "string" }]>, "=", true>,
    Expect<Invoke<typeof isSchema, [v: {}]>, "=", true>,
  ];

  /** returns false for booleans */
  export type Booleans = [
    Expect<Invoke<typeof isSchema, [v: true]>, "=", false>,
    Expect<Invoke<typeof isSchema, [v: false]>, "=", false>,
  ];

  /** returns false for null and undefined */
  export type NullAndUndefined = [
    Expect<Invoke<typeof isSchema, [v: null]>, "=", false>,
    Expect<Invoke<typeof isSchema, [v: undefined]>, "=", false>,
  ];
}

/** Normalize a JSONSchema7Definition (which can be `boolean`) to a schema */
export const asDef = (v: JSONSchema7Definition): JSONSchema7 =>
  typeof v === "boolean" ? (v ? {} : { not: {} }) : v;

declare namespace asDef {
  type StringSchema = Fixture<JSONSchema7, { type: "string" }>;

  /** passes through object schemas unchanged */
  export type PassesThroughObjects = Expect<
    Invoke<typeof asDef, [v: StringSchema]>,
    "is",
    StringSchema
  >;

  /** converts true to empty schema {} */
  export type TrueToEmpty = Expect<Invoke<typeof asDef, [v: true]>, "=", {}>;

  /** converts false to { not: {} } */
  export type FalseToNot = Expect<
    Invoke<typeof asDef, [v: false]>,
    "=",
    { not: {} }
  >;
}

export const infer = (schema: JSONSchema7): JSONSchema7TypeName | undefined => {
  if (schema.type)
    return Array.isArray(schema.type) ? schema.type[0] : schema.type;

  // Infer from a const value
  if (schema.const !== undefined) {
    const t = typeof schema.const;
    if (t === "string" || t === "number" || t === "boolean") return t;
  }

  // Infer from the presence of type-specific keywords
  if (schema.properties || schema.additionalProperties || schema.required)
    return "object";

  if (schema.items || schema.minItems != null || schema.maxItems != null)
    return "array";

  if (
    schema.minimum != null ||
    schema.maximum != null ||
    schema.multipleOf != null
  )
    return "number";

  if (schema.minLength != null || schema.maxLength != null || schema.pattern)
    return "string";

  return undefined;
};

declare namespace infer {
  /** returns explicit type when set as a string */
  export type ExplicitType = [
    Expect<Invoke<typeof infer, [schema: { type: "string" }]>, "=", "string">,
    Expect<Invoke<typeof infer, [schema: { type: "number" }]>, "=", "number">,
    Expect<Invoke<typeof infer, [schema: { type: "boolean" }]>, "=", "boolean">,
    Expect<Invoke<typeof infer, [schema: { type: "object" }]>, "=", "object">,
    Expect<Invoke<typeof infer, [schema: { type: "array" }]>, "=", "array">,
  ];

  /** returns first element when type is an array */
  export type FirstOfTypeArray = Expect<
    Invoke<typeof infer, [schema: { type: ["string", "null"] }]>,
    "=",
    "string"
  >;

  /** infers object from properties keyword */
  export type ObjectFromProperties = Expect<
    Invoke<typeof infer, [schema: { properties: { foo: { type: "string" } } }]>,
    "=",
    "object"
  >;

  /** infers object from additionalProperties keyword */
  export type ObjectFromAdditionalProperties = Expect<
    Invoke<typeof infer, [schema: { additionalProperties: true }]>,
    "=",
    "object"
  >;

  /** infers object from required keyword */
  export type ObjectFromRequired = Expect<
    Invoke<typeof infer, [schema: { required: ["foo"] }]>,
    "=",
    "object"
  >;

  /** infers array from items keyword */
  export type ArrayFromItems = Expect<
    Invoke<typeof infer, [schema: { items: { type: "string" } }]>,
    "=",
    "array"
  >;

  /** infers array from minItems */
  export type ArrayFromMinItems = Expect<
    Invoke<typeof infer, [schema: { minItems: 1 }]>,
    "=",
    "array"
  >;

  /** infers array from maxItems */
  export type ArrayFromMaxItems = Expect<
    Invoke<typeof infer, [schema: { maxItems: 5 }]>,
    "=",
    "array"
  >;

  /** infers number from minimum */
  export type NumberFromMinimum = Expect<
    Invoke<typeof infer, [schema: { minimum: 0 }]>,
    "=",
    "number"
  >;

  /** infers number from maximum */
  export type NumberFromMaximum = Expect<
    Invoke<typeof infer, [schema: { maximum: 100 }]>,
    "=",
    "number"
  >;

  /** infers number from multipleOf */
  export type NumberFromMultipleOf = Expect<
    Invoke<typeof infer, [schema: { multipleOf: 2 }]>,
    "=",
    "number"
  >;

  /** infers string from minLength */
  export type StringFromMinLength = Expect<
    Invoke<typeof infer, [schema: { minLength: 1 }]>,
    "=",
    "string"
  >;

  /** infers string from maxLength */
  export type StringFromMaxLength = Expect<
    Invoke<typeof infer, [schema: { maxLength: 50 }]>,
    "=",
    "string"
  >;

  /** infers string from pattern */
  export type StringFromPattern = Expect<
    Invoke<typeof infer, [schema: { pattern: "^[a-z]+$" }]>,
    "=",
    "string"
  >;

  /** returns undefined when no type can be inferred */
  export type Uninferrable = [
    Expect<Invoke<typeof infer, [schema: {}]>, "undefined">,
    Expect<Invoke<typeof infer, [schema: { title: "Something" }]>, "undefined">,
  ];
}
