<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { inputType, readonly, stringValue } from "../../defaults/common.js";
  import PlaceholderOption from "../../defaults/PlaceholderOption.svelte";
  import Label from "./Label.svelte";

  let { node, model }: Field.Props<"string"> = $props();

  const value = $derived(stringValue(node, model));
  const disabled = $derived(readonly(node, model));
</script>

<Label {node} {model}>
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
</Label>
