<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Tuple.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet eachTuplePositionIsRenderedWithItsConcretePath(
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
      { coords: [10, 20] },
      {
        type: "object",
        properties: {
          coords: {
            type: "array",
            items: [{ type: "number" }, { type: "number" }],
          },
        },
        required: ["coords"],
      },
    );
    expect(pocket.el.querySelector('[data-path="coords.0"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="coords.1"]')).not.toBeNull();
  })}
{/snippet}

{#snippet tuplePositionsRenderInputsMatchingTheirSchemaTypes(
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
      { pair: ["hello", 42] },
      {
        type: "object",
        properties: {
          pair: {
            type: "array",
            items: [{ type: "string" }, { type: "number" }],
          },
        },
        required: ["pair"],
      },
    );
    const firstInput = pocket.el.querySelector(
      '[data-path="pair.0"] input',
    ) as HTMLInputElement | null;
    const secondInput = pocket.el.querySelector(
      '[data-path="pair.1"] input',
    ) as HTMLInputElement | null;
    expect(firstInput).not.toBeNull();
    expect(firstInput!.type).toBe("text");
    expect(secondInput).not.toBeNull();
    expect(secondInput!.type).toBe("number");
  })}
{/snippet}

{#snippet noPushOrSpliceButtonsAreRenderedForTuples(
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
      { coords: [0, 0] },
      {
        type: "object",
        properties: {
          coords: {
            type: "array",
            items: [{ type: "number" }, { type: "number" }],
          },
        },
        required: ["coords"],
      },
    );
    expect(pocket.el.querySelector('[data-action="push"]')).toBeNull();
    expect(pocket.el.querySelector('[data-action="splice"]')).toBeNull();
  })}
{/snippet}

{#snippet tupleNestedInsideAnArrayResolvesItemPathsCorrectly(
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
        points: [
          [1, 2],
          [3, 4],
        ],
      },
      {
        type: "object",
        properties: {
          points: {
            type: "array",
            items: {
              type: "array",
              items: [{ type: "number" }, { type: "number" }],
            },
          },
        },
        required: ["points"],
      },
    );
    expect(pocket.el.querySelector('[data-path="points.0.0"]')).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="points.1.1"]')).not.toBeNull();
  })}
{/snippet}
