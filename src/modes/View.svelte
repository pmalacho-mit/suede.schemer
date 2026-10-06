<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./View.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet stringInputIsDisabled(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "view", { name: "Alice" }, {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        });
    const input = pocket.el.querySelector(
      '[data-path="name"] input',
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  })}
{/snippet}

{#snippet checkboxIsDisabled(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "view", { active: true }, {
          type: "object",
          properties: { active: { type: "boolean" } },
          required: ["active"],
        });
    const checkbox = pocket.el.querySelector(
      '[data-path="active"] input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  })}
{/snippet}

{#snippet optInAndOptOutButtonsAreAbsentForOptionalFields(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "view", { nickname: "Neo" }, {
          type: "object",
          properties: { nickname: { type: "string" } },
        });
    expect(pocket.el.querySelector('[data-action="opt-out"]')).toBeNull();
    expect(pocket.el.querySelector('[data-action="opt-in"]')).toBeNull();
  })}
{/snippet}

{#snippet arrayHasNoPushOrSpliceButtons(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "view", { tags: ["alpha", "beta"] }, {
          type: "object",
          properties: { tags: { type: "array", items: { type: "string" } } },
          required: ["tags"],
        });
    expect(pocket.el.querySelector('[data-action="push"]')).toBeNull();
    expect(pocket.el.querySelector('[data-action="splice"]')).toBeNull();
  })}
{/snippet}
