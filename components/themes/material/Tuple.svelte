<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Group from "./Group.svelte";

  let { node, model, parent, renderChild }: Field.Props<"tuple"> = $props();
</script>

<Group {node} {model} {parent}>
  <div class="positions">
    {#each node.itemNodes as itemNode, index (index)}
      {@render renderChild(itemNode, "tuple", index)}
    {/each}
  </div>
</Group>

<style>
  /* positions side by side, wrapping on a narrow screen */
  .positions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9em, 1fr));
    gap: var(--sc-spacing);
  }
</style>
