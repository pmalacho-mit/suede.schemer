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
    <div class="row">
      <label class="selector" {...attributes.role("variant-selector")}>
        <span class="name" {...attributes.role("name")}>Type</span>
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
    </div>
  {/if}

  {#if selected >= 0}
    {@render renderChild(node.variants[selected], "oneOf")}
  {/if}
</Group>

<style>
  /* the variant's kind, chosen like ticking one of a form's printed options */
  .row {
    container-type: inline-size;
  }

  .selector {
    display: flex;
    flex-direction: column;
    gap: 0.05em;
  }

  .name {
    font-size: 1.14em;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.065em;
    line-height: 1.35;
    color: color-mix(in srgb, var(--sc-text) 80%, var(--sc-background));
  }

  select {
    box-sizing: border-box;
    width: 100%;
    max-width: 16em;
    height: 2em;
    margin: 0;
    padding: 0.2em 1.5em 0 0.15em;
    font: inherit;
    font-style: italic;
    color: var(--sc-accent);
    background-color: transparent;
    background-image: linear-gradient(
        45deg,
        transparent 50%,
        var(--sc-accent) 50%
      ),
      linear-gradient(135deg, var(--sc-accent) 50%, transparent 50%);
    background-position:
      calc(100% - 0.75em) 58%,
      calc(100% - 0.45em) 58%;
    background-size:
      0.3em 0.3em,
      0.3em 0.3em;
    background-repeat: no-repeat;
    border: 0;
    border-bottom: 1px solid var(--sc-paper-rule);
    border-radius: 0;
    appearance: none;
    cursor: pointer;
  }

  select:hover {
    border-bottom-color: var(--sc-accent);
  }

  select:focus-visible {
    outline: none;
    border-bottom-color: var(--sc-accent);
    box-shadow: 0 1px 0 var(--sc-accent);
    background-color: color-mix(in srgb, var(--sc-accent) 5%, transparent);
  }

  @container (min-width: 26em) {
    .selector {
      display: grid;
      grid-template-columns: var(--sc-paper-label-width) minmax(0, 1fr);
      column-gap: var(--sc-spacing);
      align-items: baseline;
    }
  }
</style>
