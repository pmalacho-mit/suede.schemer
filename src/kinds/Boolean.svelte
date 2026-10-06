<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Boolean.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema, sharedSchemas } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersACheckbox(
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
    await render(pocket, "edit", { active: false }, schemas.active);
    expect(
      pocket.el.querySelector('[data-path="active"] input[type="checkbox"]'),
    ).not.toBeNull();
  })}
{/snippet}

{#snippet checkboxIsPreCheckedWhenDataValueIsTrue(
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
    await render(pocket, "edit", { active: true }, schemas.active);
    const checkbox = pocket.el.querySelector(
      '[data-path="active"] input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  })}
{/snippet}

{#snippet clickingTheCheckboxUpdatesTheModel(
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
    await render(pocket, "edit", { active: false }, schemas.active);
    const checkbox = pocket.el.querySelector(
      '[data-path="active"] input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(pocket.model.get({ kind: "boolean", path: "active" })).toBe(true);
  })}
{/snippet}
