<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { actions } from "./common.js";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<Action {node} {model} onclick={() => actions.push(node, model)} action="push">
  + Add item
</Action>
