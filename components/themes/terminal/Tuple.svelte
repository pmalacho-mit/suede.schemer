<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Group from "./Group.svelte";

  let { node, model, renderChild }: Field.Props<"tuple"> = $props();
</script>

<Group {node} {model}>
  <div class="positions">
    {#each node.itemNodes as itemNode, index (index)}
      {@render renderChild(itemNode, "tuple", index)}
    {/each}
  </div>
</Group>

<style>
  /* fixed positions, side by side as columns when there is room */
  .positions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18ch, 1fr));
    gap: var(--sc-spacing) calc(var(--sc-spacing) * 1.5);
  }
</style>
