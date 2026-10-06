<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { actions } from "./common.js";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<Action
  {node}
  {model}
  onclick={() => actions.insert(node, model, index)}
  action="insert"
  detail={`at ${index}`}
>
  + Insert
</Action>
