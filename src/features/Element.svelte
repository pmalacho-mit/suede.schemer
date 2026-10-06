<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Element.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet modelElementReturnsTheDivForATopLevelField(
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
      { name: "" },
      {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
    );
    const element = pocket.model.element({ path: "name" });
    expect(element).not.toBeNull();
    expect(element?.dataset.path).toBe("name");
  })}
{/snippet}

{#snippet modelElementReturnsTheDivForANestedField(
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
      { address: { city: "" } },
      {
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: { city: { type: "string" } },
            required: ["city"],
          },
        },
        required: ["address"],
      },
    );
    const element = pocket.model.element({ path: "address.city" });
    expect(element).not.toBeNull();
    expect(element?.dataset.path).toBe("address.city");
  })}
{/snippet}

{#snippet modelElementReturnsTheDivForAnArrayItem(
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
    const element0 = pocket.model.element({ path: "tags.0" });
    const element1 = pocket.model.element({ path: "tags.1" });
    expect(element0).not.toBeNull();
    expect(element0?.dataset.path).toBe("tags.0");
    expect(element1).not.toBeNull();
    expect(element1?.dataset.path).toBe("tags.1");
  })}
{/snippet}

{#snippet modelElementReturnsTheDivForAFieldNestedInsideAnArrayItem(
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
      { people: [{ name: "Alice" }, { name: "Bob" }] },
      {
        type: "object",
        properties: {
          people: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" } },
              required: ["name"],
            },
          },
        },
        required: ["people"],
      },
    );
    const element0 = pocket.model.element({ path: "people.0.name" });
    const element1 = pocket.model.element({ path: "people.1.name" });
    expect(element0).not.toBeNull();
    expect(element0?.dataset.path).toBe("people.0.name");
    expect(element1).not.toBeNull();
    expect(element1?.dataset.path).toBe("people.1.name");
  })}
{/snippet}

{#snippet modelElementReturnsUndefinedForAnOutOfBoundsArrayIndex(
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
      { tags: ["alpha"] },
      {
        type: "object",
        properties: { tags: { type: "array", items: { type: "string" } } },
        required: ["tags"],
      },
    );
    const element = pocket.model.element({ path: "tags.5" });
    expect(element).toBeUndefined();
  })}
{/snippet}

{#snippet modelElementReturnsUndefinedForANonExistentPath(
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
      { name: "" },
      {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
    );
    const element = pocket.model.element({ path: "does.not.exist" });
    expect(element).toBeUndefined();
  })}
{/snippet}
