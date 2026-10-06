// Helpers for the namespace tests in schema.ts, which import this module only
// as a type: they build the render tree the form is drawn from.
import { root } from "../../../release/nodes.ts";
import type { RenderNode } from "../../../release/types.ts";
import { schema } from "./schema.ts";

const stepNode = async () => {
  const tree = await root(schema);
  if (tree.kind !== "object") throw new Error("expected an object");
  const steps = tree.children.find((c) => c.path === "steps");
  if (steps?.kind !== "array") throw new Error("expected an array of steps");
  if (steps.itemNode.kind !== "oneOf") throw new Error("expected a oneOf");
  return steps.itemNode;
};

/** The titles of a step's variants, in order. */
export const variantTitles = async () =>
  (await stepNode()).variants.map((v) => v.title);

const paths = (node: RenderNode): string[] => {
  const children =
    node.kind === "object"
      ? node.children
      : node.kind === "tuple"
        ? node.itemNodes
        : [];
  return children.flatMap((child) => [child.path, ...paths(child)]);
};

/** Every field path under the variant titled `variant`, depth first. */
export const fieldPaths = async (variant: string) => {
  const found = (await stepNode()).variants.find((v) => v.title === variant);
  if (!found) throw new Error(`no variant ${variant}`);
  return paths(found);
};
