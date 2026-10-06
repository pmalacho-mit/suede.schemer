// Helpers for the namespace tests in nodes.tests.ts, which import this module
// only as a type.
import type { RenderNode } from "../release/types.ts";

const object = (node: RenderNode) => {
  if (node.kind !== "object") throw new Error(`expected object node, got ${node.kind}`);
  return node;
};

/** The child of an object node at `path`. */
export const child = (node: RenderNode, path: string): RenderNode => {
  const found = object(node).children.find((c) => c.path === path);
  if (!found) throw new Error(`no child at ${path}`);
  return found;
};

/** An object node's required property names, in order. */
export const required = (node: RenderNode): string[] => [...object(node).required];
