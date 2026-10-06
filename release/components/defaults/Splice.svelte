<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { actions } from "./common.js";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<Action
  {node}
  {model}
  onclick={() => actions.splice(node, model, index)}
  action="splice"
  detail={`at ${index}`}
>
  Remove
</Action>
