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
  /* positions side by side, like the boxes of one line on a printed form */
  .positions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15em), 1fr));
    gap: var(--sc-spacing) calc(var(--sc-spacing) * 2);
  }
</style>
