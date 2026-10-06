<script lang="ts">
  import type { Field } from "../Field.svelte";
  import {
    attributes,
    inputType,
    readonly,
    stringValue,
    title,
    tooltip,
  } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"string"> = $props();

  const value = $derived(stringValue(node, model));
  const disabled = $derived(readonly(node, model));
</script>

<label>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select {value} {disabled} onchange={model.on(node)}>
      <PlaceholderOption />
      {#each node.options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  {:else}
    <input {value} type={inputType(node)} {disabled} oninput={model.on(node)} />
  {/if}
</label>
