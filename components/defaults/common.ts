import type { Model } from "../..";
import type { Kind, RenderNode, SpecificNode } from "../../types";
import type { SchemaModel } from "../../models.svelte.js";
import { basename } from "../naming.js";

export const is = {
  const: (node: RenderNode): node is SpecificNode<"string"> =>
    node.kind === "string" && node.const !== undefined,
};

/** Extracts const-valued string children as a key→value map, keyed by field basename. */
export const constDiscriminators = (
  children: SpecificNode<"object">["children"],
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const child of children)
    if (is.const(child)) result[basename(child.path)] = child.const;
  return result;
};

type Defaultable = Exclude<Kind, "oneOf" | "enum" | "unknown">;

export const defaults = {
  string: "",
  number: 0,
  boolean: false,
  get object() {
    return {};
  },
  array: [],
  tuple: [],
} satisfies Record<Defaultable, unknown>;

export const defaultable = (
  node: RenderNode,
): node is RenderNode & { kind: Defaultable } => node.kind in defaults;

export const valueForNode = (node: RenderNode): unknown => {
  if (node.kind === "array") {
    const itemDefault = valueForNode(node.itemNode);
    return itemDefault !== null ? [itemDefault] : [];
  }
  if (node.kind === "tuple") return node.itemNodes.map(valueForNode);
  if (node.kind === "object") return constDiscriminators(node.children);
  if ("default" in node)
    return node.default ?? defaults[node.kind as Defaultable];
  return defaultable(node) ? defaults[node.kind] : null;
};

export const title = (node: RenderNode, model: Model) =>
  node.title ?? (model.abbreviatePaths ? basename(node.path) : node.path);

export const tooltip = (node: RenderNode, model: Model) =>
  !node.title && model.abbreviatePaths ? node.path : undefined;

export const attributes = Object.assign(
  (node: RenderNode) => ({
    "data-kind": node.kind,
    "data-path": node.path,
  }),
  {
    role: (
      detail:
        | "container"
        | "name"
        | "placeholder"
        | "variant-selector"
        | "description"
        | "root-container",
    ) => ({
      "data-role": detail,
    }),
  },
);

// ---------------------------------------------------------------------------
// What a field's component does, apart from how it looks. The defaults and
// every theme share these, so a themed component is markup and styles.
// ---------------------------------------------------------------------------

const formats = {
  email: "email",
  uri: "url",
  "date-time": "datetime-local",
  date: "date",
} as const;

/** The `<input type>` for a string node, from its `format`. */
export const inputType = ({ format }: SpecificNode<"string">) =>
  format && format in formats
    ? formats[format as keyof typeof formats]
    : "text";

/** Whether a field is read-only: outside edit mode, or a string `const`. */
export const readonly = (node: RenderNode, model: SchemaModel) =>
  !model.editable || is.const(node);

/** A string field's value: its `const` if it has one, else the model's. */
export const stringValue = (node: SpecificNode<"string">, model: SchemaModel) =>
  node.const !== undefined ? String(node.const) : model.get(node);

/** The change handler of an enum's `<select>`, mapping the chosen text back to its option. */
export const onEnumChange = (node: SpecificNode<"enum">, model: SchemaModel) =>
  model.on(node, (value) =>
    node.options.find((option) => String(option) === value),
  );

/** What each action button does to the model. */
export const actions = {
  /** gives an absent optional field its default value */
  optIn: (node: RenderNode, model: SchemaModel) =>
    model.set(node, valueForNode(node)),
  /** removes an optional field's value */
  optOut: (node: RenderNode, model: SchemaModel) => model.remove(node),
  /** appends an item with the item schema's default value */
  push: (node: SpecificNode<"array">, model: SchemaModel) =>
    model.get(node)?.push(valueForNode(node.itemNode)),
  /** inserts an item before `index` */
  insert: (node: SpecificNode<"array">, model: SchemaModel, index: number) =>
    model.get(node)?.splice(index, 0, valueForNode(node.itemNode)),
  /** removes the item at `index` */
  splice: (node: SpecificNode<"array">, model: SchemaModel, index: number) =>
    model.get(node)?.splice(index, 1),
};

export const array = {
  /** the array's current items */
  items: (node: SpecificNode<"array">, model: SchemaModel): unknown[] =>
    model.get(node) ?? [],
  /** whether another item may be added: in edit mode, below `maxItems` */
  addable: (node: SpecificNode<"array">, model: SchemaModel) =>
    model.editable &&
    (node.maxItems == null ||
      (model.get(node)?.length ?? 0) < node.maxItems),
};

export const variants = {
  /**
   * Exact structural match: checks whether the current value is described
   * by the given variant node based on type and const discriminators.
   * Does not check required field presence — `fuzzy` is the fallback
   * for object variants that lack const discriminators.
   */
  exact: (value: unknown, variant: RenderNode): boolean => {
    switch (variant.kind) {
      case "string":
        if (typeof value !== "string") return false;
        if (variant.options && !variant.options.includes(value)) return false;
        return true;
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value))
          return false;
        for (const [key, val] of Object.entries(
          constDiscriminators(variant.children),
        ))
          if ((value as Record<string, unknown>)[key] !== val) return false;
        return true;
      case "array":
        return Array.isArray(value);
      case "enum":
        return variant.options.includes(value);
      default:
        return false;
    }
  },

  /**
   * Fuzzy fallback for object variants without const discriminators.
   * Scores each variant by how many of its required fields are present
   * in the value, and returns the index of the best match.
   * Returns -1 if no variant scores above zero.
   */
  fuzzy: (value: unknown, candidates: RenderNode[]): number => {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return -1;
    const casted = value as Record<string, unknown>;
    let bestIndex = -1;
    let bestScore = 0;
    for (let i = 0; i < candidates.length; i++) {
      const variant = candidates[i];
      if (variant.kind !== "object") continue;
      let score = 0;
      for (const key of variant.required) if (key in casted) score++;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    return bestIndex;
  },

  /** The index of the variant the model's value is, or -1 for none. */
  selected: (node: SpecificNode<"oneOf">, model: SchemaModel) => {
    const value = model.get(node);
    const exact = node.variants.findIndex((v) => variants.exact(value, v));
    return exact >= 0 ? exact : variants.fuzzy(value, node.variants);
  },

  /** Switches the value to the variant at `index`, with its default value. */
  select: (
    node: SpecificNode<"oneOf">,
    model: SchemaModel,
    index: string | number,
  ) => model.set(node, valueForNode(node.variants[Number(index)])),

  /** A variant's label: its title, else a const discriminator, else its position. */
  label: (variant: RenderNode, index: number): string => {
    if (variant.title) return variant.title;
    if (variant.kind === "object")
      for (const child of variant.children)
        if (is.const(child)) return String(child.const);
    return `Option ${index + 1}`;
  },
};
