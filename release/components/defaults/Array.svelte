<script lang="ts">
  import type { Field } from "../Field.svelte";
  import ArrayAction from "../ArrayAction.svelte";
  import { arrayItemAtIndex } from "../naming.js";
  import { array, attributes, title, tooltip } from "./common.js";

  let {
    node,
    model,
    renderChild,
    pushRenderer,
    spliceRenderer,
    insertRenderer,
  }: Field.Props<"array"> = $props();

  const items = $derived(array.items(node, model));
  const addable = $derived(array.addable(node, model));

  import type Self from "./Array.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderNode as Node } from "../../types.js";
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#each items as _, index (index)}
    {#if addable}
      <ArrayAction action="insert" renderer={insertRenderer} {node} {model} {index} />
    {/if}

    {@render renderChild(arrayItemAtIndex(node, index), "array", index)}

    {#if model.editable}
      <ArrayAction action="splice" renderer={spliceRenderer} {node} {model} {index} />
    {/if}
  {/each}

  {#if addable}
    <ArrayAction action="push" renderer={pushRenderer} {node} {model} index={items.length} />
  {/if}
</fieldset>

{#snippet existingItemsAreRendered(
  ArrayField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { tags: ["alpha", "beta"] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ArrayField
    node={{ kind: "array", path: "tags", itemNode: { kind: "string", path: "tags.*" } }}
    {model}
    renderChild={child}
    pushRenderer={null}
    spliceRenderer={null}
    insertRenderer={null}
  />
  {test(async ({ expect }) => {
    expect(document.querySelectorAll('[data-path^="tags."]')).toHaveLength(2);
  })}
{/snippet}

{#snippet pushButtonAddsANewItem(
  ArrayField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { tags: [] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ArrayField
    node={{ kind: "array", path: "tags", itemNode: { kind: "string", path: "tags.*" } }}
    {model}
    renderChild={child}
    pushRenderer={null}
    spliceRenderer={null}
    insertRenderer={null}
  />
  {test(async ({ expect, user }) => {
    await user.click(document.querySelector('[data-action="push"]')!);
    expect(model.get({ path: "tags" })).toEqual([""]);
  })}
{/snippet}

{#snippet spliceButtonRemovesAnItem(
  ArrayField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { tags: ["alpha", "beta"] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ArrayField
    node={{ kind: "array", path: "tags", itemNode: { kind: "string", path: "tags.*" } }}
    {model}
    renderChild={child}
    pushRenderer={null}
    spliceRenderer={null}
    insertRenderer={null}
  />
  {test(async ({ expect, user }) => {
    await user.click(document.querySelector('[data-action="splice"]')!);
    expect(model.get({ path: "tags" })).toEqual(["beta"]);
  })}
{/snippet}

{#snippet pushButtonIsAbsentWhenMaxItemsIsReached(
  ArrayField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { tags: ["alpha", "beta"] })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ArrayField
    node={{
      kind: "array",
      path: "tags",
      itemNode: { kind: "string", path: "tags.*" },
      maxItems: 2,
    }}
    {model}
    renderChild={child}
    pushRenderer={null}
    spliceRenderer={null}
    insertRenderer={null}
  />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-action="push"]')).toBeNull();
  })}
{/snippet}

{#snippet arrayOfObjectsRendersFieldsetsWithCorrectChildPaths(
  ArrayField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {
    people: [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ],
  })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ArrayField
    node={{
      kind: "array",
      path: "people",
      itemNode: {
        kind: "object",
        path: "people.*",
        children: [
          { kind: "string", path: "people.*.name" },
          { kind: "number", path: "people.*.age" },
        ],
        required: new Set(["name", "age"]),
      },
    }}
    {model}
    renderChild={child}
    pushRenderer={null}
    spliceRenderer={null}
    insertRenderer={null}
  />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-path="people.0.name"]')).not.toBeNull();
    expect(document.querySelector('[data-path="people.1.age"]')).not.toBeNull();
  })}
{/snippet}
