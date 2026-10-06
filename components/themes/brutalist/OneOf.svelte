<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { attributes, variants } from "../../defaults/common.js";
  import PlaceholderOption from "../../defaults/PlaceholderOption.svelte";
  import Group from "./Group.svelte";

  let { node, model, parent, renderChild }: Field.Props<"oneOf"> = $props();

  const selected = $derived(variants.selected(node, model));
</script>

<Group {node} {model} {parent}>
  {#if model.editable}
    <label class="selector" {...attributes.role("variant-selector")}>
      <span class="tag" {...attributes.role("name")}>Type</span>
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
    <div class="variant">
      {@render renderChild(node.variants[selected], "oneOf")}
    </div>
  {/if}
</Group>

<style>
  /* the variant switch: a pink "TYPE" stamp fused to a yellow select */
  .selector {
    display: inline-flex;
    align-self: flex-start;
    align-items: stretch;
    max-width: 100%;
    font-size: 0.9em;
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: var(--sc-shadow) var(--sc-shadow) 0 var(--sc-border);
    overflow: hidden;
  }

  .tag {
    display: flex;
    align-items: center;
    padding: 0 0.85em;
    font-size: 0.82em;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sc-accent-contrast);
    background: var(--sc-highlight);
    border-right: var(--sc-stroke) solid var(--sc-border);
  }

  select {
    appearance: none;
    min-width: 0;
    height: 2.5em;
    margin: 0;
    padding: 0 2.6em 0 0.85em;
    font: inherit;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--sc-accent-contrast);
    border: 0;
    border-radius: 0;
    cursor: pointer;
    background-color: var(--sc-accent);
    background-image: linear-gradient(45deg, transparent 50%, currentColor 50%),
      linear-gradient(135deg, currentColor 50%, transparent 50%);
    background-position:
      calc(100% - 1.25em) 50%,
      calc(100% - 0.9em) 50%;
    background-size:
      0.36em 0.36em,
      0.36em 0.36em;
    background-repeat: no-repeat;
  }

  select:hover {
    background-color: color-mix(
      in srgb,
      var(--sc-accent) 70%,
      var(--sc-surface)
    );
  }

  .selector:focus-within {
    outline: var(--sc-stroke) solid var(--sc-border);
    outline-offset: 3px;
  }

  select:focus-visible {
    outline: none;
  }

  /* the chosen variant's fields, set off by a heavy rule on their left */
  .variant {
    padding-left: var(--sc-spacing);
    border-left: calc(var(--sc-stroke) * 2) solid var(--sc-accent);
  }
</style>
