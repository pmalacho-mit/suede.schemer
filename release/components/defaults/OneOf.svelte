<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, tooltip, title, variants } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model, renderChild }: Field.Props<"oneOf"> = $props();

  const selected = $derived(variants.selected(node, model));
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#if model.editable}
    <label {...attributes.role("variant-selector")}>
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
</fieldset>
