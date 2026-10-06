<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Group from "./Group.svelte";

  let { node, model, parent, renderChild }: Field.Props<"object"> = $props();
</script>

<!-- a variant's object is already framed by its oneOf's panel -->
<Group {node} {model} flat={parent === "oneOf"}>
  {#each node.children as child (child.path)}
    {@render renderChild(child, "object")}
  {/each}
</Group>
