<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Optional.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema, sharedSchemas } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet absentOptionalFieldShowsOptInNotAnInput(
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
    await render(pocket, "edit", {}, schemas.nickname);
    expect(pocket.el.querySelector('[data-action="opt-in"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="nickname"] input')).toBeNull();
  })}
{/snippet}

{#snippet clickingOptInRevealsTheInputField(
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
    await render(pocket, "edit", {}, schemas.nickname);
    const optIn = pocket.el.querySelector(
      '[data-action="opt-in"]',
    ) as HTMLButtonElement;
    await user.click(optIn);
    expect(
      pocket.el.querySelector('[data-path="nickname"] input'),
    ).not.toBeNull();
  })}
{/snippet}

{#snippet requiredFieldHasNoOptInButton(
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
    expect(pocket.el.querySelector('[data-action="opt-in"]')).toBeNull();
    expect(pocket.el.querySelector('[data-path="name"] input')).not.toBeNull();
  })}
{/snippet}

{#snippet aPresentOptionalFieldShowsAnOptOutButton(
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
    await render(pocket, "edit", { nickname: "Neo" }, schemas.nickname);
    expect(pocket.el.querySelector('[data-action="opt-out"]')).not.toBeNull();
  })}
{/snippet}

{#snippet clickingOptOutRemovesTheValueAndShowsOptInAgain(
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
    await render(pocket, "edit", { nickname: "Neo" }, schemas.nickname);
    const optOut = pocket.el.querySelector(
      '[data-action="opt-out"]',
    ) as HTMLButtonElement;
    await user.click(optOut);
    expect(
      pocket.model.get({ kind: "string", path: "nickname" }),
    ).toBeUndefined();
    expect(pocket.el.querySelector('[data-action="opt-in"]')).not.toBeNull();
  })}
{/snippet}
