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
    <!-- two segments: what is being chosen, and the tonal choice -->
    <label class="segmented" {...attributes.role("variant-selector")}>
      <span class="lead" {...attributes.role("name")}>Type</span>
      <span class="choice" class:chosen={selected >= 0}>
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
  .segmented {
    display: inline-flex;
    align-self: flex-start;
    max-width: 100%;
    height: calc(2.5em / 0.875);
    font-size: 0.875em;
    font-weight: 500;
    letter-spacing: 0.00714em;
  }

  .segmented > span {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    border: 1px solid var(--sc-border);
  }

  .lead {
    padding: 0 1em;
    color: var(--sc-muted);
    border-radius: 999px 0 0 999px;
  }

  .choice {
    min-width: 0;
    margin-left: -1px;
    border-radius: 0 999px 999px 0;
  }

  select {
    box-sizing: border-box;
    min-width: 7em;
    max-width: 100%;
    height: 100%;
    margin: 0;
    padding: 0 2.5em 0 1em;
    font: inherit;
    letter-spacing: inherit;
    color: var(--sc-text);
    background: transparent;
    border: 0;
    border-radius: 0 999px 999px 0;
    appearance: none;
    cursor: pointer;
  }

  select option {
    color: var(--sc-text);
    background: var(--sc-background);
  }

  /* a choice made: the segment fills, tonal, with a check before it */
  .chosen {
    background: var(--sc-md-tonal);
  }

  .chosen select {
    padding-left: 2.4em;
  }

  .chosen::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 1.15em;
    box-sizing: border-box;
    width: 0.45em;
    height: 0.85em;
    border: solid var(--sc-text);
    border-width: 0 0.14em 0.14em 0;
    transform: translate(-50%, -62%) rotate(45deg);
    pointer-events: none;
  }

  /* the caret */
  .choice::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 1em;
    border: 0.33em solid transparent;
    border-top-color: var(--sc-muted);
    border-bottom-width: 0;
    transform: translateY(-50%);
    pointer-events: none;
  }

  /* the state layer */
  select:hover {
    background: color-mix(in srgb, var(--sc-text) 8%, transparent);
  }

  select:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
    background: color-mix(in srgb, var(--sc-text) 10%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    select {
      transition: background-color 150ms;
    }
  }
</style>
