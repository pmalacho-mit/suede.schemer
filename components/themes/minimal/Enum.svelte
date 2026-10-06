<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { onEnumChange } from "../../defaults/common.js";
  import PlaceholderOption from "../../defaults/PlaceholderOption.svelte";
  import Label from "./Label.svelte";

  let { node, model }: Field.Props<"enum"> = $props();
</script>

<Label {node} {model}>
  <select
    value={model.get(node)}
    disabled={!model.editable}
    onchange={onEnumChange(node, model)}
  >
    <PlaceholderOption />
    {#each node.options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</Label>
