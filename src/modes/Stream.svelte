<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Stream.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet inputsAreDisabled(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "stream", { name: "Alice" }, {
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
    await render(pocket, "stream", { tags: ["alpha"] }, {
          type: "object",
          properties: { tags: { type: "array", items: { type: "string" } } },
          required: ["tags"],
        });
    expect(pocket.el.querySelector('[data-action="push"]')).toBeNull();
    expect(pocket.el.querySelector('[data-action="splice"]')).toBeNull();
  })}
{/snippet}

{#snippet rendersWithPartiallyDefinedDataWithoutCrashing(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    // Stream data may arrive before all fields are populated
    await render(pocket, "stream", {}, {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name", "age"],
        });
    expect(
      pocket.el.querySelector('[data-path="name"] input'),
    ).not.toBeNull();
    expect(pocket.el.querySelector('[data-path="age"] input')).not.toBeNull();
  })}
{/snippet}

{#snippet applypartialUpdatesAStringField(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(pocket, "stream", {}, {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        });
    const input = pocket.el.querySelector(
      '[data-path="name"] input',
    ) as HTMLInputElement;
    expect(input.value).toBe("");
    flushSync(() => pocket.model.applyPartial({ name: "Alice" }));
    expect(input.value).toBe("Alice");
  })}
{/snippet}

{#snippet applypartialUpdatesANumberField(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(pocket, "stream", {}, {
          type: "object",
          properties: { age: { type: "number" } },
          required: ["age"],
        });
    const input = pocket.el.querySelector(
      '[data-path="age"] input',
    ) as HTMLInputElement;
    flushSync(() => pocket.model.applyPartial({ age: 42 }));
    expect(Number(input.value)).toBe(42);
  })}
{/snippet}

{#snippet applypartialUpdatesANestedFieldWithoutOverwritingSiblings(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(pocket, "stream", { address: { city: "Boston" } }, {
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
        });
    flushSync(() =>
      pocket.model.applyPartial({ address: { street: "123 Main St" } }),
    );
    const street = pocket.el.querySelector(
      '[data-path="address.street"] input',
    ) as HTMLInputElement;
    const city = pocket.el.querySelector(
      '[data-path="address.city"] input',
    ) as HTMLInputElement;
    expect(street.value).toBe("123 Main St");
    expect(city.value).toBe("Boston"); // untouched
  })}
{/snippet}

{#snippet applypartialStreamsInArrayItemsOneByOne(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(pocket, "stream", { tags: [] }, {
          type: "object",
          properties: { tags: { type: "array", items: { type: "string" } } },
          required: ["tags"],
        });
    expect(pocket.el.querySelectorAll('[data-path^="tags."]').length).toBe(0);

    flushSync(() => pocket.model.set({ path: "tags" }, ["alpha"]));
    expect(pocket.el.querySelectorAll('[data-path^="tags."]').length).toBe(1);

    flushSync(() => pocket.model.set({ path: "tags" }, ["alpha", "beta"]));
    expect(pocket.el.querySelectorAll('[data-path^="tags."]').length).toBe(2);
  })}
{/snippet}

{#snippet multipleApplyPartialCallsAccumulateIntoFinalState(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, flushSync }) => {
    await render(pocket, "stream", {}, {
          type: "object",
          properties: {
            first: { type: "string" },
            last: { type: "string" },
          },
          required: ["first", "last"],
        });

    flushSync(() => {
      pocket.model.applyPartial({ first: "Jane" });
      pocket.model.applyPartial({ last: "Doe" });
    });
    const first = pocket.el.querySelector(
      '[data-path="first"] input',
    ) as HTMLInputElement;
    const last = pocket.el.querySelector(
      '[data-path="last"] input',
    ) as HTMLInputElement;
    expect(first.value).toBe("Jane");
    expect(last.value).toBe("Doe");
  })}
{/snippet}
