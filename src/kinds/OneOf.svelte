<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./OneOf.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema, sharedSchemas } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersAVariantSelectorDropdown(
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
      { contact: {} },
      {
        type: "object",
        properties: {
          contact: {
            oneOf: [
              {
                type: "object",
                title: "Email",
                properties: { email: { type: "string", format: "email" } },
                required: ["email"],
              },
              {
                type: "object",
                title: "Phone",
                properties: { phone: { type: "string" } },
                required: ["phone"],
              },
            ],
          },
        },
        required: ["contact"],
      },
    );
    expect(
      pocket.el.querySelector('[data-role="variant-selector"] select'),
    ).not.toBeNull();
  })}
{/snippet}

{#snippet optionLabelsInTheSelectorMatchSchemaTitles(
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
      {},
      {
        oneOf: [
          { type: "string", title: "Text" },
          { type: "number", title: "Count" },
          { type: "boolean", title: "Flag" },
        ],
      },
    );
    const select = pocket.el.querySelector(
      '[data-role="variant-selector"] select',
    ) as HTMLSelectElement;
    const labels = Array.from(select.options)
      .filter((o) => !o.disabled)
      .map((o) => o.text);
    expect(labels).toEqual(["Text", "Count", "Flag"]);
  })}
{/snippet}

{#snippet selectingAVariantRendersItsFields(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  schemas: typeof sharedSchemas,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, user }) => {
    await render(pocket, "edit", {}, schemas.primitiveOneOf);
    const select = pocket.el.querySelector(
      '[data-role="variant-selector"] select',
    ) as HTMLSelectElement;
    await user.selectOptions(select, "Text");
    expect(pocket.el.querySelector('[data-kind="string"]')).not.toBeNull();
  })}
{/snippet}

{#snippet preSelectsTheVariantThatMatchesExistingData(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  schemas: typeof sharedSchemas,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", 42, schemas.primitiveOneOf);
    expect(
      pocket.el.querySelector('[data-kind="number"] input'),
    ).not.toBeNull();
  })}
{/snippet}
