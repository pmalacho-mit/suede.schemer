<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Object.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersAFieldsetWithItsTitleAsTheLegend(
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
      { name: "", age: 0 },
      {
        type: "object",
        title: "User",
        properties: { name: { type: "string" }, age: { type: "number" } },
        required: ["name", "age"],
      },
    );
    const fieldset = pocket.el.querySelector("fieldset");
    expect(fieldset).not.toBeNull();
    expect(fieldset!.querySelector("legend")?.textContent?.trim()).toBe("User");
  })}
{/snippet}

{#snippet allPropertiesAreRenderedAsChildren(
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
      { name: "", age: 0, active: false },
      {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
          active: { type: "boolean" },
        },
        required: ["name", "age", "active"],
      },
    );
    expect(pocket.el.querySelector('[data-path="name"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="age"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="active"]')).not.toBeNull();
  })}
{/snippet}

{#snippet nestedObjectsRenderAsNestedFieldsetsWithCorrectPaths(
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
      { address: { street: "", city: "" } },
      {
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
            },
            required: ["street", "city"],
          },
        },
        required: ["address"],
      },
    );
    expect(
      pocket.el.querySelectorAll("fieldset").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      pocket.el.querySelector('[data-path="address.street"]'),
    ).not.toBeNull();
    expect(
      pocket.el.querySelector('[data-path="address.city"]'),
    ).not.toBeNull();
  })}
{/snippet}
