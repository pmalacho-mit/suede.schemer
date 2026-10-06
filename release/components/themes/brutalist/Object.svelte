<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Group from "./Group.svelte";

  let { node, model, parent, renderChild }: Field.Props<"object"> = $props();
</script>

<Group {node} {model} {parent}>
  {#each node.children as child (child.path)}
    {@render renderChild(child, "object")}
  {/each}
</Group>
