<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./SchemaFeatures.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet titleAttributeAppearsInTheFieldLabel(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { firstName: "" }, {
          type: "object",
          properties: { firstName: { type: "string", title: "First Name" } },
          required: ["firstName"],
        });
    const nameEl = pocket.el.querySelector(
      '[data-path="firstName"] [data-role="name"]',
    );
    expect(nameEl?.textContent?.trim()).toBe("First Name");
  })}
{/snippet}

{#snippet allofMergesPropertiesFromMultipleSubSchemas(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { name: "", age: 0 }, {
          allOf: [
            {
              type: "object",
              properties: { name: { type: "string" } },
              required: ["name"],
            },
            {
              type: "object",
              properties: { age: { type: "number" } },
              required: ["age"],
            },
          ],
        });
    expect(pocket.el.querySelector('[data-path="name"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="age"]')).not.toBeNull();
  })}
{/snippet}

{#snippet refIsResolvedToTheReferencedDefinition(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { name: "" }, {
          definitions: { Name: { type: "string", title: "Full Name" } },
          type: "object",
          properties: { name: { $ref: "#/definitions/Name" } },
          required: ["name"],
        });
    const nameEl = pocket.el.querySelector(
      '[data-path="name"] [data-role="name"]',
    );
    expect(nameEl?.textContent?.trim()).toBe("Full Name");
  })}
{/snippet}

{#snippet pathAbbreviationShowsBasenameNotFullPathInLabel(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { address: { streetName: "" } }, {
          type: "object",
          properties: {
            address: {
              type: "object",
              properties: { streetName: { type: "string" } },
              required: ["streetName"],
            },
          },
          required: ["address"],
        });
    const nameEl = pocket.el.querySelector(
      '[data-path="address.streetName"] [data-role="name"]',
    );
    expect(nameEl?.textContent?.trim()).toBe("streetName");
  })}
{/snippet}
