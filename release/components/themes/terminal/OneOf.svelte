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
    <!-- a switch on the command line: `--type [ Card ▾ ]` -->
    <label class="selector" {...attributes.role("variant-selector")}>
      <span class="flag" {...attributes.role("name")}>Type</span>
      <span class="control">
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
      </span>
    </label>
  {/if}

  {#if selected >= 0}
    {@render renderChild(node.variants[selected], "oneOf")}
  {/if}
</Group>

<style>
  .selector {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 1ch;
    align-self: flex-start;
    max-width: 100%;
  }

  /* `Type`, printed as a flag */
  .flag {
    color: var(--sc-muted);
    text-transform: lowercase;
  }

  .flag::before {
    content: "--";
    content: "--" / "";
  }

  .control {
    display: flex;
    align-items: center;
    gap: 0.5ch;
    color: var(--sc-muted);
  }

  .control::before {
    content: "[";
    content: "[" / "";
  }

  .control::after {
    content: "▾ ]";
    content: "▾ ]" / "";
  }

  .control:focus-within {
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
  }

  select {
    min-width: 12ch;
    height: 1.9em;
    margin: 0;
    padding: 0 0.75ch;
    font: inherit;
    font-weight: 600;
    color: var(--sc-accent);
    text-shadow: none;
    background: transparent;
    border: 0;
    border-bottom: 1px dashed var(--sc-border);
    border-radius: 0;
    appearance: none;
    cursor: pointer;
  }

  select:hover {
    border-bottom-color: var(--sc-muted);
  }

  select:focus-visible {
    outline: none;
    background: color-mix(in srgb, var(--sc-accent) 9%, transparent);
    border-bottom: 1px solid var(--sc-accent);
  }

  option {
    color: var(--sc-text);
    background: var(--sc-surface);
  }
</style>
