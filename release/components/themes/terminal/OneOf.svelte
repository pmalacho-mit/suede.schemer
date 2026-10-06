<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { attributes, variants } from "../../defaults/common.js";
  import PlaceholderOption from "../../defaults/PlaceholderOption.svelte";
  import Group from "./Group.svelte";

  let { node, model, renderChild }: Field.Props<"oneOf"> = $props();

  const selected = $derived(variants.selected(node, model));
</script>

<Group {node} {model}>
  {#if model.editable}
    <label class="selector" {...attributes.role("variant-selector")}>
      <span {...attributes.role("name")}>Type</span>
      <select
        value={selected}
        onchange={({ currentTarget: { value } }) =>
          variants.select(node, model, value)}
      >
        <PlaceholderOption />
        {#each node.variants as variant, i}
          <option value={i}>{variants.label(variant, i)}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if selected >= 0}
    {@render renderChild(node.variants[selected], "oneOf")}
  {/if}
</Group>

<style>
  .selector {
    display: inline-flex;
    align-items: center;
    gap: 0.6em;
    align-self: flex-start;
    padding: 0.2em 0.2em 0.2em 0.75em;
    font-size: 0.9em;
    color: var(--sc-muted);
    background: color-mix(in srgb, var(--sc-border) 45%, transparent);
    border-radius: var(--sc-radius);
  }

  select {
    height: 2em;
    padding: 0 0.6em;
    font: inherit;
    color: var(--sc-text);
    background: var(--sc-surface);
    border: 1px solid var(--sc-border);
    border-radius: calc(var(--sc-radius) * 0.75);
  }

  select:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 1px;
  }
</style>
