// Helpers for the namespace tests in patch.ts, which imports this module only
// as a type.
import type { JSONSchema7 } from "json-schema";
// nodes.ts directly: the index brings every theme, whose styles a node test cannot load
import { root } from "../../../release/nodes.ts";
import { defaultFor, schema } from "./patch.ts";

/** `defaultFor` the node built from the part of the patch schema at `pointer` (a JSON pointer). */
export const defaultAt = async (pointer: string) => {
  const part = pointer
    .split("/")
    .filter(Boolean)
    .reduce<unknown>(
      (at, key) => (at as Record<string, unknown>)[key],
      schema,
    ) as JSONSchema7;
  return defaultFor(await root(part));
};
