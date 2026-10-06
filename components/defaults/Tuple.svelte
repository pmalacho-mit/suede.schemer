<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";

  let { node, model, renderChild }: Field.Props<"tuple"> = $props();

  import type Self from "./Tuple.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { acrossThemes } from "../../_internal/across.ts";
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
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(TupleField, () => new Model("edit", { coords: [10, 20] }), "tuple")}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
        node={{
          kind: "tuple",
          path: "coords",
          itemNodes: [
            { kind: "number", path: "coords.0" },
            { kind: "number", path: "coords.1" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      expect(element.querySelector('[data-path="coords.0"]')).not.toBeNull();
      expect(element.querySelector('[data-path="coords.1"]')).not.toBeNull();
    }),
  )}
{/snippet}

{#snippet tuplePositionsRenderInputsMatchingTheirSchemaTypes(
  TupleField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(TupleField, () => new Model("edit", { pair: ["hello", 42] }), "tuple")}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
        node={{
          kind: "tuple",
          path: "pair",
          itemNodes: [
            { kind: "string", path: "pair.0" },
            { kind: "number", path: "pair.1" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      const first = element.querySelector(
        '[data-path="pair.0"] input',
      ) as HTMLInputElement;
      const second = element.querySelector(
        '[data-path="pair.1"] input',
      ) as HTMLInputElement;
      expect(first.type).toBe("text");
      expect(second.type).toBe("number");
    }),
  )}
{/snippet}

{#snippet noPushOrSpliceButtonsAreRenderedForTuples(
  TupleField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(TupleField, () => new Model("edit", { coords: [0, 0] }), "tuple")}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
        node={{
          kind: "tuple",
          path: "coords",
          itemNodes: [
            { kind: "number", path: "coords.0" },
            { kind: "number", path: "coords.1" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      expect(element.querySelector('[data-action="push"]')).toBeNull();
      expect(element.querySelector('[data-action="splice"]')).toBeNull();
    }),
  )}
{/snippet}

<!-- a tuple as an array's item: drawn through Field, which picks the array's component -->
{#snippet tupleNestedInsideAnArrayResolvesItemPathsCorrectly(
  TupleField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(TupleField, () => new Model("edit", {
    points: [
      [1, 2],
      [3, 4],
    ],
  }), "tuple")}
  <themes.Across {variants}>
    {#snippet variant({ model })}
      <AnyField
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
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      expect(element.querySelector('[data-path="points.0.0"]')).not.toBeNull();
      expect(element.querySelector('[data-path="points.1.1"]')).not.toBeNull();
    }),
  )}
{/snippet}
