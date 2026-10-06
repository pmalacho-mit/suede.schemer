<script lang="ts">
  import type { Field } from "../Field.svelte";
  import ArrayAction from "../ArrayAction.svelte";
  import { arrayItemAtIndex } from "../naming.js";
  import { array, attributes, title, tooltip } from "./common.js";

  let {
    node,
    model,
    renderChild,
    pushRenderer,
    spliceRenderer,
    insertRenderer,
  }: Field.Props<"array"> = $props();

  const items = $derived(array.items(node, model));
  const addable = $derived(array.addable(node, model));
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#each items as _, index (index)}
    {#if addable}
      <ArrayAction action="insert" renderer={insertRenderer} {node} {model} {index} />
    {/if}

    {@render renderChild(arrayItemAtIndex(node, index), "array", index)}

    {#if model.editable}
      <ArrayAction action="splice" renderer={spliceRenderer} {node} {model} {index} />
    {/if}
  {/each}

  {#if addable}
    <ArrayAction action="push" renderer={pushRenderer} {node} {model} index={items.length} />
  {/if}
</fieldset>
