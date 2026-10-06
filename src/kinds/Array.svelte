<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Array.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet existingItemsAreRendered(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(
      pocket,
      "edit",
      { tags: ["alpha", "beta"] },
      {
        type: "object",
        properties: { tags: { type: "array", items: { type: "string" } } },
        required: ["tags"],
      },
    );
    expect(pocket.el.querySelectorAll('[data-path^="tags."]').length).toBe(2);
  })}
{/snippet}

{#snippet pushButtonAddsANewItem(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, user }) => {
    await render(
      pocket,
      "edit",
      { tags: [] },
      {
        type: "object",
        properties: { tags: { type: "array", items: { type: "string" } } },
        required: ["tags"],
      },
    );
    await user.click(pocket.el.querySelector('[data-action="push"]')!);
    expect(pocket.model!.get<"array">({ path: "tags" })!.length).toBe(1);
  })}
{/snippet}

{#snippet spliceButtonRemovesAnItem(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, user }) => {
    await render(
      pocket,
      "edit",
      { tags: ["alpha", "beta"] },
      {
        type: "object",
        properties: { tags: { type: "array", items: { type: "string" } } },
        required: ["tags"],
      },
    );

    await user.click(pocket.el.querySelector('[data-action="splice"]')!);
    expect(pocket.model!.get<"array">({ path: "tags" })!.length).toBe(1);
  })}
{/snippet}

{#snippet pushButtonIsAbsentWhenMaxItemsIsReached(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(
      pocket,
      "edit",
      { tags: ["alpha", "beta"] },
      {
        type: "object",
        properties: {
          tags: { type: "array", items: { type: "string" }, maxItems: 2 },
        },
        required: ["tags"],
      },
    );
    expect(pocket.el.querySelector('[data-action="push"]')).toBeNull();
  })}
{/snippet}

{#snippet arrayOfObjectsRendersFieldsetsWithCorrectChildPaths(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(
      pocket,
      "edit",
      {
        people: [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
        ],
      },
      {
        type: "object",
        properties: {
          people: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                age: { type: "number" },
              },
              required: ["name", "age"],
            },
          },
        },
        required: ["people"],
      },
    );
    expect(
      pocket.el.querySelector('[data-path="people.0.name"]'),
    ).not.toBeNull();
    expect(
      pocket.el.querySelector('[data-path="people.1.age"]'),
    ).not.toBeNull();
  })}
{/snippet}
