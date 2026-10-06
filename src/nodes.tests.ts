import type { JSONSchema7 } from "json-schema";
import type {
  Expect,
  FromFile,
  Invoke,
  Throws,
} from "../suede.nests/dsl.import.meta.vitest.ts";
import { root } from "../release/nodes.ts";
import type { child, required } from "./nodes.harness.ts";

// ---------------------------------------------------------------------------
// Primitive types
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.strings {
  /** builds a string node */
  export type BuildsNode = Expect<
    Invoke<typeof root, [schema: { type: "string" }]>["kind"],
    "=",
    "string"
  >;

  /** carries title, description, format, default */
  export type CarriesFields = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "string";
          title: "Name";
          description: "Your name";
          format: "email";
          default: "foo@example.com";
        },
      ]
    >,
    "matches",
    {
      kind: "string";
      title: "Name";
      description: "Your name";
      format: "email";
      default: "foo@example.com";
    }
  >;

  /** carries string enum options */
  export type CarriesOptions = Expect<
    Invoke<typeof root, [schema: { type: "string"; enum: ["a", "b"] }]>,
    "matches",
    { kind: "string"; options: ["a", "b"] }
  >;

  /** throws when enum options are not all strings */
  export type NonStringOptions = Throws<
    Invoke<typeof root, [schema: { type: "string"; enum: [1, 2] }]>,
    "expected array of strings"
  >;

  /** throws when default is not a string */
  export type NonStringDefault = Throws<
    Invoke<typeof root, [schema: { type: "string"; default: 42 }]>,
    "expected string"
  >;
}

declare namespace buildRenderTree.numbers {
  /** builds a number node */
  export type BuildsNode = Expect<
    Invoke<typeof root, [schema: { type: "number" }]>["kind"],
    "=",
    "number"
  >;

  /** builds an integer node as kind=number */
  export type IntegerIsNumber = Expect<
    Invoke<typeof root, [schema: { type: "integer" }]>["kind"],
    "=",
    "number"
  >;

  /** carries min, max, default */
  export type CarriesFields = Expect<
    Invoke<
      typeof root,
      [schema: { type: "number"; minimum: 0; maximum: 100; default: 42 }]
    >,
    "matches",
    { kind: "number"; min: 0; max: 100; default: 42 }
  >;

  /** falls back to exclusiveMinimum/exclusiveMaximum */
  export type ExclusiveBounds = Expect<
    Invoke<
      typeof root,
      [schema: { type: "number"; exclusiveMinimum: 1; exclusiveMaximum: 9 }]
    >,
    "matches",
    { kind: "number"; min: 1; max: 9 }
  >;

  /** throws when enum options are not all numbers */
  export type NonNumberOptions = Throws<
    Invoke<typeof root, [schema: { type: "number"; enum: ["x"] }]>,
    "expected array of numbers"
  >;

  /** throws when default is not a number */
  export type NonNumberDefault = Throws<
    Invoke<typeof root, [schema: { type: "number"; default: "oops" }]>,
    "expected number"
  >;
}

declare namespace buildRenderTree.booleans {
  /** builds a boolean node */
  export type BuildsNode = Expect<
    Invoke<typeof root, [schema: { type: "boolean" }]>["kind"],
    "=",
    "boolean"
  >;

  /** carries default */
  export type CarriesDefault = Expect<
    Invoke<typeof root, [schema: { type: "boolean"; default: true }]>,
    "matches",
    { kind: "boolean"; default: true }
  >;

  /** throws when enum options are not all booleans */
  export type NonBooleanOptions = Throws<
    Invoke<typeof root, [schema: { type: "boolean"; enum: ["yes"] }]>,
    "expected array of booleans"
  >;

  /** throws when default is not a boolean */
  export type NonBooleanDefault = Throws<
    Invoke<typeof root, [schema: { type: "boolean"; default: 1 }]>,
    "expected boolean"
  >;
}

// ---------------------------------------------------------------------------
// Unknown
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.unknowns {
  /** returns unknown for a schema with no type or inferrable keywords */
  export type Uninferrable = Expect<
    Invoke<typeof root, [schema: { title: "Mystery" }]>["kind"],
    "=",
    "unknown"
  >;
}

// ---------------------------------------------------------------------------
// Enum (untyped)
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.untypedEnums {
  /** builds an enum node for mixed-type enums with no type */
  export type MixedTypes = Expect<
    Invoke<typeof root, [schema: { enum: [1, "two", true] }]>,
    "matches",
    { kind: "enum"; options: [1, "two", true] }
  >;

  /** carries title and description */
  export type CarriesFields = Expect<
    Invoke<
      typeof root,
      [schema: { enum: ["a", "b"]; title: "Choice"; description: "Pick one" }]
    >,
    "matches",
    { kind: "enum"; title: "Choice"; description: "Pick one" }
  >;
}

// ---------------------------------------------------------------------------
// Object
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.objects {
  /** builds an object node */
  export type BuildsNode = Expect<
    Invoke<typeof root, [schema: { type: "object" }]>["kind"],
    "=",
    "object"
  >;

  /** builds children for each property */
  export type ChildPerProperty = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "object";
          properties: { name: { type: "string" }; age: { type: "number" } };
        },
      ]
    >,
    "matches",
    { kind: "object"; children: [{ kind: "string" }, { kind: "number" }] }
  >;

  /** marks non-required properties as optional */
  export type NonRequiredOptional = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "object";
          properties: { a: { type: "string" }; b: { type: "string" } };
          required: ["a"];
        },
      ]
    >,
    "matches",
    {
      kind: "object";
      children: [{ path: "a"; optional: false }, { path: "b"; optional: true }];
    }
  >;

  /** builds nested paths with dot notation */
  export type NestedPaths = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "object";
          properties: {
            address: {
              type: "object";
              properties: { city: { type: "string" } };
            };
          };
        },
      ]
    >,
    "matches",
    {
      kind: "object";
      children: [{ kind: "object"; children: [{ path: "address.city" }] }];
    }
  >;

  /** infers object from properties keyword (no explicit type) */
  export type InfersFromProperties = Expect<
    Invoke<typeof root, [schema: { properties: { x: { type: "number" } } }]>["kind"],
    "=",
    "object"
  >;

  /** exposes the required Set on the node */
  export type ExposesRequired = Expect<
    Invoke<
      typeof required,
      [
        node: Invoke<
          typeof root,
          [
            schema: {
              type: "object";
              properties: { a: { type: "string" } };
              required: ["a"];
            },
          ]
        >,
      ]
    >,
    "=",
    ["a"]
  >;

  /** skips boolean sub-schemas in properties */
  export type SkipsBooleanSchemas = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "object";
          properties: { allowed: true; denied: false; real: { type: "string" } };
        },
      ]
    >,
    "matches",
    { kind: "object"; children: [{ path: "real" }] }
  >;
}

// ---------------------------------------------------------------------------
// Array
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.arrays {
  /** builds an array node */
  export type BuildsNode = Expect<
    Invoke<typeof root, [schema: { type: "array" }]>["kind"],
    "=",
    "array"
  >;

  /** builds itemNode from items schema */
  export type ItemNodeFromItems = Expect<
    Invoke<typeof root, [schema: { type: "array"; items: { type: "string" } }]>,
    "matches",
    { kind: "array"; itemNode: { kind: "string" } }
  >;

  /** uses an empty unknown itemNode when no items defined */
  export type UnknownItemNode = Expect<
    Invoke<typeof root, [schema: { type: "array" }]>,
    "matches",
    { kind: "array"; itemNode: { kind: "unknown" } }
  >;

  /** builds itemNode path as <path>.* */
  export type ItemNodePath = Expect<
    Invoke<typeof root, [schema: { type: "array"; items: { type: "number" } }]>,
    "matches",
    { kind: "array"; itemNode: { path: ".*" } }
  >;

  /** carries minItems and maxItems */
  export type CarriesBounds = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "array";
          items: { type: "string" };
          minItems: 1;
          maxItems: 5;
        },
      ]
    >,
    "matches",
    { kind: "array"; minItems: 1; maxItems: 5 }
  >;

  /**
   * builds a tuple node from an array of item schemas, one item node each
   * (formerly "merges tuple items (array of schemas) via allOf", before
   * tuple support)
   */
  export type TupleItems = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "array";
          items: [
            { type: "string"; properties: { a: { type: "string" } } },
            { type: "object"; properties: { b: { type: "number" } } },
          ];
        },
      ]
    >,
    "matches",
    {
      kind: "tuple";
      itemNodes: [
        { kind: "string"; path: ".0" },
        { kind: "object"; path: ".1"; children: [{ kind: "number"; path: ".1.b" }] },
      ];
    }
  >;

  /** infers array from items keyword (no explicit type) */
  export type InfersFromItems = Expect<
    Invoke<typeof root, [schema: { items: { type: "boolean" } }]>["kind"],
    "=",
    "array"
  >;
}

// ---------------------------------------------------------------------------
// $ref resolution
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.refs {
  /** resolves a $ref to a definition */
  export type ToDefinition = Expect<
    Invoke<
      typeof root,
      [schema: { $ref: "#/$defs/Name"; $defs: { Name: { type: "string" } } }]
    >["kind"],
    "=",
    "string"
  >;

  /** resolves a $ref inside object properties */
  export type InProperties = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          type: "object";
          $defs: { Age: { type: "number" } };
          properties: { age: { $ref: "#/$defs/Age" } };
        },
      ]
    >,
    "matches",
    { kind: "object"; children: [{ kind: "number" }] }
  >;
}

// ---------------------------------------------------------------------------
// Composition — allOf
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.allOf {
  /** merges allOf into a single object node */
  export type SingleObject = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          allOf: [
            { type: "object"; properties: { a: { type: "string" } } },
            { properties: { b: { type: "number" } } },
          ];
        },
      ]
    >,
    "matches",
    { kind: "object"; children: [{ path: "a" }, { path: "b" }] }
  >;
}

// ---------------------------------------------------------------------------
// Composition — oneOf / anyOf
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.variants {
  /** builds a oneOf variant node for multiple oneOf schemas */
  export type FromOneOf = Expect<
    Invoke<typeof root, [schema: { oneOf: [{ type: "string" }, { type: "number" }] }]>,
    "matches",
    { kind: "oneOf"; variants: [{ kind: "string" }, { kind: "number" }] }
  >;

  /** builds a oneOf variant node for multiple anyOf schemas */
  export type FromAnyOf = Expect<
    Invoke<typeof root, [schema: { anyOf: [{ type: "boolean" }, { type: "string" }] }]>,
    "matches",
    { kind: "oneOf"; variants: [{}, {}] }
  >;

  /** inlines a single-variant oneOf */
  export type InlinesOneOf = Expect<
    Invoke<typeof root, [schema: { oneOf: [{ type: "string" }] }]>["kind"],
    "=",
    "string"
  >;

  /** inlines a single-variant anyOf */
  export type InlinesAnyOf = Expect<
    Invoke<typeof root, [schema: { anyOf: [{ type: "number" }] }]>["kind"],
    "=",
    "number"
  >;

  /** propagates parent title/description to the variant node */
  export type PropagatesFields = Expect<
    Invoke<
      typeof root,
      [
        schema: {
          title: "Union";
          description: "One of these";
          oneOf: [{ type: "string" }, { type: "number" }];
        },
      ]
    >,
    "matches",
    { title: "Union"; description: "One of these" }
  >;
}

// ---------------------------------------------------------------------------
// path argument
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.path {
  /** uses the provided root path */
  export type Provided = Expect<
    Invoke<typeof root, [schema: { type: "string" }, path: "root"]>["path"],
    "=",
    "root"
  >;

  /** defaults to empty string path */
  export type DefaultsToEmpty = Expect<
    Invoke<typeof root, [schema: { type: "string" }]>["path"],
    "=",
    ""
  >;
}

// ---------------------------------------------------------------------------
// Integration — real example schemas
// ---------------------------------------------------------------------------

declare namespace buildRenderTree.examples.address {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/address/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** has all 7 properties as string children */
  export type SevenStrings = Expect<
    Node,
    "matches",
    {
      children: [
        { kind: "string" },
        { kind: "string" },
        { kind: "string" },
        { kind: "string" },
        { kind: "string" },
        { kind: "string" },
        { kind: "string" },
      ];
    }
  >;

  /** marks locality, region, countryName as required */
  export type Required = [
    Expect<Invoke<typeof required, [node: Node]>, "=", ["locality", "region", "countryName"]>,
    Expect<Invoke<typeof child, [node: Node, path: "locality"]>["optional"], "=", false>,
    Expect<Invoke<typeof child, [node: Node, path: "postalCode"]>["optional"], "=", true>,
  ];
}

declare namespace buildRenderTree.examples.blogPost {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/blog-post/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node with 5 children */
  export type FiveChildren = Expect<
    Node,
    "matches",
    { kind: "object"; children: [{}, {}, {}, {}, {}] }
  >;

  /** renders publishedDate as a string with format=date-time */
  export type PublishedDate = Expect<
    Invoke<typeof child, [node: Node, path: "publishedDate"]>,
    "matches",
    { kind: "string"; format: "date-time" }
  >;

  /** renders tags as an array of strings */
  export type Tags = Expect<
    Invoke<typeof child, [node: Node, path: "tags"]>,
    "matches",
    { kind: "array"; itemNode: { kind: "string" } }
  >;
}

declare namespace buildRenderTree.examples.calendar {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/calendar/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** has 11 properties */
  export type ElevenProperties = Expect<
    Node,
    "matches",
    { children: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}] }
  >;

  /** renders all scalar fields as strings */
  export type ScalarsAreStrings = Expect<
    Node,
    "matches",
    {
      children: [
        { path: "startDate"; kind: "string" },
        { path: "endDate"; kind: "string" },
        { path: "summary"; kind: "string" },
        { path: "location"; kind: "string" },
        { path: "url"; kind: "string" },
        { path: "duration"; kind: "string" },
        { path: "recurrenceDate"; kind: "string" },
        { path: "recurrenceDule"; kind: "string" },
        { path: "category"; kind: "string" },
        { path: "description"; kind: "string" },
        { path: "geo" },
      ];
    }
  >;
}

declare namespace buildRenderTree.examples.device {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/device/schema.json", "json", JSONSchema7>]
  >;

  /** produces a oneOf variant node with 2 variants */
  export type TwoVariants = Expect<Node, "matches", { kind: "oneOf"; variants: [{}, {}] }>;

  /** each variant is an object node */
  export type ObjectVariants = Expect<
    Node,
    "matches",
    { variants: [{ kind: "object" }, { kind: "object" }] }
  >;
}

declare namespace buildRenderTree.examples.ecommerce {
  /** does not throw */
  export type DoesNotThrow = Expect<
    Invoke<
      typeof root,
      [schema: FromFile<"../public/ecommerce/schema.json", "json", JSONSchema7>]
    >,
    "defined"
  >;
}

declare namespace buildRenderTree.examples.geographicalLocation {
  type Node = Invoke<
    typeof root,
    [
      schema: FromFile<
        "../public/geographical-location/schema.json",
        "json",
        JSONSchema7
      >,
    ]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** has latitude and longitude as number children with min/max */
  export type Coordinates = [
    Expect<
      Invoke<typeof child, [node: Node, path: "latitude"]>,
      "matches",
      { kind: "number"; min: -90; max: 90 }
    >,
    Expect<
      Invoke<typeof child, [node: Node, path: "longitude"]>,
      "matches",
      { kind: "number"; min: -180; max: 180 }
    >,
  ];

  /** marks both fields as required */
  export type BothRequired = [
    Expect<Invoke<typeof required, [node: Node]>, "=", ["latitude", "longitude"]>,
    Expect<Node, "matches", { children: [{ optional: false }, { optional: false }] }>,
  ];
}

declare namespace buildRenderTree.examples.healthRecord {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/health-record/schema.json", "json", JSONSchema7>]
  >;

  type StringArray = { kind: "array"; itemNode: { kind: "string" } };

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** renders dateOfBirth as string with format=date */
  export type DateOfBirth = Expect<
    Invoke<typeof child, [node: Node, path: "dateOfBirth"]>,
    "matches",
    { kind: "string"; format: "date" }
  >;

  /** renders array fields (allergies, conditions, medications) with string items */
  export type StringArrays = [
    Expect<Invoke<typeof child, [node: Node, path: "allergies"]>, "matches", StringArray>,
    Expect<Invoke<typeof child, [node: Node, path: "conditions"]>, "matches", StringArray>,
    Expect<Invoke<typeof child, [node: Node, path: "medications"]>, "matches", StringArray>,
  ];
}

declare namespace buildRenderTree.examples.jobPosting {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/job-posting/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** renders salary as a number with min=0 */
  export type Salary = Expect<
    Invoke<typeof child, [node: Node, path: "salary"]>,
    "matches",
    { kind: "number"; min: 0 }
  >;

  /** renders applicationDeadline as string with format=date */
  export type ApplicationDeadline = Expect<
    Invoke<typeof child, [node: Node, path: "applicationDeadline"]>,
    "matches",
    { kind: "string"; format: "date" }
  >;

  /** marks title, company, location, description as required */
  export type Required = Expect<
    Invoke<typeof required, [node: Node]>,
    "=",
    ["title", "company", "location", "description"]
  >;
}

declare namespace buildRenderTree.examples.movie {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/movie/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** renders genre as a string node with enum options */
  export type Genre = Expect<
    Invoke<typeof child, [node: Node, path: "genre"]>,
    "matches",
    { kind: "string"; options: ["Action", "Comedy", "Drama", "Science Fiction"] }
  >;

  /** renders cast as an array of strings */
  export type Cast = Expect<
    Invoke<typeof child, [node: Node, path: "cast"]>,
    "matches",
    { kind: "array"; itemNode: { kind: "string" } }
  >;
}

declare namespace buildRenderTree.examples.userProfile {
  type Node = Invoke<
    typeof root,
    [schema: FromFile<"../public/user-profile/schema.json", "json", JSONSchema7>]
  >;

  /** produces an object node */
  export type ObjectNode = Expect<Node["kind"], "=", "object">;

  /** renders email as string with format=email */
  export type Email = Expect<
    Invoke<typeof child, [node: Node, path: "email"]>,
    "matches",
    { kind: "string"; format: "email" }
  >;

  /** renders age as number with min=0 */
  export type Age = Expect<
    Invoke<typeof child, [node: Node, path: "age"]>,
    "matches",
    { kind: "number"; min: 0 }
  >;

  /** renders interests as an array of strings */
  export type Interests = Expect<
    Invoke<typeof child, [node: Node, path: "interests"]>,
    "matches",
    { kind: "array"; itemNode: { kind: "string" } }
  >;

  /** marks username and email as required */
  export type Required = Expect<
    Invoke<typeof required, [node: Node]>,
    "=",
    ["username", "email"]
  >;
}
