<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"number"> = $props();

  const disabled = $derived(!model.editable);
  const value = $derived(model.get(node));
  const on = $derived(model.on(node, Number));

  import type Self from "./Number.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
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
  test: Test,
)}
  {@const model = new Model("edit", { age: 0 })}
  <NumberField node={{ kind: "number", path: "age" }} {model} />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("age") as HTMLInputElement;
    expect(input.type).toBe("number");
  })}
{/snippet}

{#snippet minimumAndMaximumPropagateToInputAttributes(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { rating: 5 })}
  <NumberField node={{ kind: "number", path: "rating", min: 1, max: 10 }} {model} />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("rating") as HTMLInputElement;
    expect(Number(input.min)).toBe(1);
    expect(Number(input.max)).toBe(10);
  })}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
  NumberField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { priority: 1 })}
  <NumberField node={{ kind: "number", path: "priority", options: [1, 2, 3] }} {model} />
  {test(async ({ expect, screen }) => {
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(Array.from(select.options).filter((o) => !o.disabled)).toHaveLength(3);
  })}
{/snippet}
