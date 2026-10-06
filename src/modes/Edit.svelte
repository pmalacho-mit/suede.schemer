<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Edit.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet inputsAreEnabled(
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
    expect(
      (pocket.el.querySelector('[data-path="name"] input') as HTMLInputElement)
        .disabled,
    ).toBe(false);
    expect(
      (pocket.el.querySelector('[data-path="age"] input') as HTMLInputElement)
        .disabled,
    ).toBe(false);
    expect(
      (
        pocket.el.querySelector(
          '[data-path="active"] input',
        ) as HTMLInputElement
      ).disabled,
    ).toBe(false);
  })}
{/snippet}

{#snippet arrayHasPushAndSpliceButtons(
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
    expect(pocket.el.querySelector('[data-action="push"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-action="splice"]')).not.toBeNull();
  })}
{/snippet}

{#snippet programmaticModelSetUpdatesAreReflectedInTheInput(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(
      pocket,
      "edit",
      { name: "Alice" },
      {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
    );
    const input = pocket.el.querySelector(
      '[data-path="name"] input',
    ) as HTMLInputElement;
    expect(input.value).toBe("Alice");
    flushSync(() => pocket.model.set({ path: "name" }, "Bob"));
    expect(input.value).toBe("Bob");
  })}
{/snippet}
