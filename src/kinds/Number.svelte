<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Number.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersANumberInput(
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
      { age: 0 },
      {
        type: "object",
        properties: { age: { type: "number" } },
        required: ["age"],
      },
    );
    const input = pocket.el.querySelector(
      '[data-path="age"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.type).toBe("number");
  })}
{/snippet}

{#snippet minimumAndMaximumPropagateToInputAttributes(
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
      { rating: 5 },
      {
        type: "object",
        properties: { rating: { type: "number", minimum: 1, maximum: 10 } },
        required: ["rating"],
      },
    );
    const input = pocket.el.querySelector(
      '[data-path="rating"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(Number(input!.min)).toBe(1);
    expect(Number(input!.max)).toBe(10);
  })}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
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
      { priority: 1 },
      {
        type: "object",
        properties: { priority: { type: "number", enum: [1, 2, 3] } },
        required: ["priority"],
      },
    );
    const select = pocket.el.querySelector(
      '[data-path="priority"] select',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    const opts = Array.from(select!.options).filter((o) => !o.disabled);
    expect(opts.length).toBe(3);
  })}
{/snippet}
