// Shared by the component tests' snippets. The harness components import this
// module only as a type, and their generated tests import it as a value, so it
// never reaches a build.
import type { JSONSchema7 } from "json-schema";
import { flushSync } from "svelte";
import { Model, root, type Schema } from "../release";
import type { Mode } from "../release/models.svelte";

/**
 * Puts what `<Schema>` renders into the pocket (the model, and the render tree
 * built from `schema`), then flushes it into the DOM.
 */
export const renderSchema = async (
  pocket: { model?: Model; root?: Schema.Node },
  mode: Mode,
  data: unknown,
  schema: JSONSchema7,
) => {
  pocket.root = await root(schema);
  pocket.model = new Model(mode, data as Record<string, unknown>);
  flushSync();
  return pocket.model;
};

/** Schemas more than one test renders. */
export const sharedSchemas = {
  /** a required boolean, `active` */
  active: {
    type: "object",
    properties: { active: { type: "boolean" } },
    required: ["active"],
  },
  /** a required untyped enum, `status` */
  status: {
    type: "object",
    properties: { status: { enum: ["draft", "published", "archived"] } },
    required: ["status"],
  },
  /** a oneOf of two primitives */
  primitiveOneOf: {
    oneOf: [
      { type: "string", title: "Text" },
      { type: "number", title: "Count" },
    ],
  },
  /** an optional string, `nickname` */
  nickname: {
    type: "object",
    properties: { nickname: { type: "string" } },
  },
} satisfies Record<string, JSONSchema7>;
