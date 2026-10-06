<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import PlaceholderOption from "../../defaults/PlaceholderOption.svelte";
  import Label from "./Label.svelte";

  let { node, model }: Field.Props<"number"> = $props();

  const on = $derived(model.on(node, Number));
</script>

<Label {node} {model}>
  {#if node.options}
    <select value={model.get(node)} disabled={!model.editable} onchange={on}>
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
      value={model.get(node)}
      disabled={!model.editable}
      oninput={on}
    />
  {/if}
</Label>
