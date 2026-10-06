<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, onEnumChange, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"enum"> = $props();
</script>

<label>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>
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
</label>
