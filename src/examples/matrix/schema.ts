// The explorer's form: the steps of the transformation (a oneOf per step,
// told apart by a const `type`), the shape to transform, and what to show.
import type { JSONSchema7 } from "json-schema";
import type {
  Expect,
  Invoke,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import type { Step, StepType } from "./linear.ts";
import type { variantTitles, fieldPaths } from "./schema.harness.ts";

export const shapes = ["Unit square", "Grid", "Letter F", "Circle"] as const;
export type Shape = (typeof shapes)[number];

/** What the form holds. */
export type MatrixData = {
  steps: Step[];
  shape: Shape;
  display: { basis: boolean; determinant: boolean; eigenvectors: boolean };
};

const discriminator = (type: StepType): JSONSchema7 => ({
  type: "string",
  const: type,
});

const entry = (title: string): JSONSchema7 => ({ type: "number", title });

const row = (title: string, left: string, right: string): JSONSchema7 => ({
  type: "array",
  title,
  items: [entry(left), entry(right)],
  minItems: 2,
  maxItems: 2,
});

const step: JSONSchema7 = {
  title: "Step",
  oneOf: [
    {
      type: "object",
      title: "Rotation",
      description: "Turns the plane about the origin, counter-clockwise.",
      properties: {
        type: discriminator("rotation"),
        degrees: {
          type: "number",
          title: "Angle",
          description: "In degrees; negative turns clockwise.",
          minimum: -360,
          maximum: 360,
          default: 90,
        },
      },
      required: ["type", "degrees"],
    },
    {
      type: "object",
      title: "Scale",
      description: "Stretches along each axis; a negative factor also flips.",
      properties: {
        type: discriminator("scale"),
        x: {
          type: "number",
          title: "Horizontal factor",
          minimum: -3,
          maximum: 3,
          default: 2,
        },
        y: {
          type: "number",
          title: "Vertical factor",
          minimum: -3,
          maximum: 3,
          default: 1,
        },
      },
      required: ["type", "x", "y"],
    },
    {
      type: "object",
      title: "Shear",
      description:
        "Slides each line parallel to an axis, in proportion to its distance.",
      properties: {
        type: discriminator("shear"),
        x: {
          type: "number",
          title: "Horizontal shear",
          description: "x′ = x + k·y",
          minimum: -3,
          maximum: 3,
          default: 1,
        },
        y: {
          type: "number",
          title: "Vertical shear",
          description: "y′ = y + k·x",
          minimum: -3,
          maximum: 3,
          default: 0,
        },
      },
      required: ["type", "x", "y"],
    },
    {
      type: "object",
      title: "Reflection",
      description: "Mirrors the plane across a line through the origin.",
      properties: {
        type: discriminator("reflection"),
        axis: {
          type: "string",
          title: "Mirror line",
          enum: ["x", "y", "y = x"],
          default: "x",
        },
      },
      required: ["type", "axis"],
    },
    {
      type: "object",
      title: "Matrix",
      description: "Any 2×2 matrix: its columns are where î and ĵ land.",
      properties: {
        type: discriminator("matrix"),
        matrix: {
          type: "array",
          title: "Entries",
          items: [row("Top row", "a", "b"), row("Bottom row", "c", "d")],
          minItems: 2,
          maxItems: 2,
        },
      },
      required: ["type", "matrix"],
    },
  ],
};

export const schema: JSONSchema7 = {
  type: "object",
  title: "Transformation",
  properties: {
    steps: {
      type: "array",
      title: "Steps",
      description:
        "Applied top to bottom: the first step acts on the plane first.",
      items: step,
      maxItems: 8,
    },
    shape: {
      type: "string",
      title: "Shape",
      description: "What to send through the transformation.",
      enum: [...shapes],
      default: "Letter F",
    },
    display: {
      type: "object",
      title: "Show",
      properties: {
        basis: {
          type: "boolean",
          title: "Basis vectors",
          description: "î and ĵ, before and after.",
        },
        determinant: {
          type: "boolean",
          title: "Determinant",
          description: "The unit square's image, with its signed area.",
        },
        eigenvectors: {
          type: "boolean",
          title: "Eigenvectors",
          description: "Lines the matrix only stretches, when it has any.",
        },
      },
      required: ["basis", "determinant", "eigenvectors"],
    },
  },
  required: ["steps", "shape", "display"],
};

/** A new step of each type, as the add buttons and the type picker make it. */
export const fresh = (type: StepType): Step => {
  switch (type) {
    case "rotation":
      return { type, degrees: 90 };
    case "scale":
      return { type, x: 2, y: 1 };
    case "shear":
      return { type, x: 1, y: 0 };
    case "reflection":
      return { type, axis: "x" };
    case "matrix":
      return {
        type,
        matrix: [
          [1, 1],
          [0, 1],
        ],
      };
  }
};

declare namespace fresh {
  /** a new rotation is a quarter turn */
  export type Rotation = Expect<
    Invoke<typeof fresh, [type: "rotation"]>,
    "=",
    { type: "rotation"; degrees: 90 }
  >;

  /** a new matrix starts as a shear, so it visibly does something */
  export type Matrix = Expect<
    Invoke<typeof fresh, [type: "matrix"]>,
    "=",
    { type: "matrix"; matrix: [[1, 1], [0, 1]] }
  >;
}

/** The order the step types are offered in. */
export const stepTypes = [
  "rotation",
  "scale",
  "shear",
  "reflection",
  "matrix",
] as const satisfies readonly StepType[];

/** The explorer as it opens: a shear, then a turn, on the letter F. */
export const initial = (): MatrixData => ({
  steps: [
    { type: "shear", x: 1, y: 0 },
    { type: "rotation", degrees: 30 },
  ],
  shape: "Letter F",
  display: { basis: true, determinant: true, eigenvectors: true },
});

declare namespace schema {
  /** each step is one of five, in the order they are offered */
  export type Variants = Expect<
    Invoke<typeof variantTitles>,
    "=",
    ["Rotation", "Scale", "Shear", "Reflection", "Matrix"]
  >;

  /** the matrix is a tuple of two tuples: four number fields, a to d */
  export type MatrixIsAGrid = Expect<
    Invoke<typeof fieldPaths, [variant: "Matrix"]>,
    "=",
    [
      "steps.*.type",
      "steps.*.matrix",
      "steps.*.matrix.0",
      "steps.*.matrix.0.0",
      "steps.*.matrix.0.1",
      "steps.*.matrix.1",
      "steps.*.matrix.1.0",
      "steps.*.matrix.1.1",
    ]
  >;
}
