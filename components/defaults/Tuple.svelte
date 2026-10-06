<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";

  let { node, model, renderChild }: Field.Props<"tuple"> = $props();

  import type Self from "./Tuple.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderNode as Node } from "../../types.js";
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#each node.itemNodes as itemNode, index (index)}
    {@render renderChild(itemNode, "tuple", index)}
  {/each}
</fieldset>

{#snippet eachTuplePositionIsRenderedWithItsConcretePath(
  TupleField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { coords: [10, 20] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <TupleField node={{
      kind: "tuple",
      path: "coords",
      itemNodes: [
        { kind: "number", path: "coords.0" },
        { kind: "number", path: "coords.1" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-path="coords.0"]')).not.toBeNull();
    expect(document.querySelector('[data-path="coords.1"]')).not.toBeNull();
  })}
{/snippet}

{#snippet tuplePositionsRenderInputsMatchingTheirSchemaTypes(
  TupleField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { pair: ["hello", 42] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <TupleField node={{
      kind: "tuple",
      path: "pair",
      itemNodes: [
        { kind: "string", path: "pair.0" },
        { kind: "number", path: "pair.1" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect }) => {
    const first = document.querySelector('[data-path="pair.0"] input') as HTMLInputElement;
    const second = document.querySelector('[data-path="pair.1"] input') as HTMLInputElement;
    expect(first.type).toBe("text");
    expect(second.type).toBe("number");
  })}
{/snippet}

{#snippet noPushOrSpliceButtonsAreRenderedForTuples(
  TupleField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { coords: [0, 0] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <TupleField node={{
      kind: "tuple",
      path: "coords",
      itemNodes: [
        { kind: "number", path: "coords.0" },
        { kind: "number", path: "coords.1" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-action="push"]')).toBeNull();
    expect(document.querySelector('[data-action="splice"]')).toBeNull();
  })}
{/snippet}

<!-- a tuple as an array's item: drawn through Field, which picks the array's component -->
{#snippet tupleNestedInsideAnArrayResolvesItemPathsCorrectly(
  TupleField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { points: [[1, 2], [3, 4]] })}
  <Field
    node={{
      kind: "array",
      path: "points",
      itemNode: {
        kind: "tuple",
        path: "points.*",
        itemNodes: [
          { kind: "number", path: "points.*.0" },
          { kind: "number", path: "points.*.1" },
        ],
      },
    }}
    {model}
  />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-path="points.0.0"]')).not.toBeNull();
    expect(document.querySelector('[data-path="points.1.1"]')).not.toBeNull();
  })}
{/snippet}
