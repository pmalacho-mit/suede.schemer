<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip, hints } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"number"> = $props();

  const disabled = $derived(!model.editable);
  const value = $derived(model.get(node));
  const on = $derived(model.on(node, Number));

  import type Self from "./Number.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { acrossThemes } from "../../_internal/across.ts";
  import type { SchemaModel } from "../../models.svelte.js";
</script>

<label>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select {value} {disabled} onchange={on}>
      <PlaceholderOption />
      {#each node.options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  {:else}
    <input
      type="number"
      {...hints(node)}
      min={node.min}
      max={node.max}
      {disabled}
      {value}
      oninput={on}
    />
  {/if}
</label>

{#snippet rendersANumberInput(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    NumberField,
    () => new Model("edit", { age: 0 }),
    "number",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component node={{ kind: "number", path: "age" }} {model} />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("age") as HTMLInputElement;
      expect(input.type).toBe("number");
    }),
  )}
{/snippet}

{#snippet minimumAndMaximumPropagateToInputAttributes(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    NumberField,
    () => new Model("edit", { rating: 5 }),
    "number",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "number", path: "rating", min: 1, max: 10 }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("rating") as HTMLInputElement;
      expect(Number(input.min)).toBe(1);
      expect(Number(input.max)).toBe(10);
    }),
  )}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    NumberField,
    () => new Model("edit", { priority: 1 }),
    "number",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "number", path: "priority", options: [1, 2, 3] }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const select = view.getByRole("combobox") as HTMLSelectElement;
      expect(
        Array.from(select.options).filter((o) => !o.disabled),
      ).toHaveLength(3);
    }),
  )}
{/snippet}

<!-- the input takes its step and placeholder from the schema (an integer steps by 1) -->
{#snippet aStepAndAnExampleShapeTheInput(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    NumberField,
    () => new Model("edit", { guests: 1, price: 2.5 }),
    "number",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "number", path: "guests", step: 1, examples: [2] }}
        {model}
      />
      <Component node={{ kind: "number", path: "price" }} {model} />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const guests = view.getByLabelText("guests") as HTMLInputElement;
      const price = view.getByLabelText("price") as HTMLInputElement;
      expect(guests.step).toBe("1");
      expect(guests.placeholder).toBe("2");
      expect(price.step).toBe("any");
    }),
  )}
{/snippet}
