<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { actions } from "./common.js";

  let { node, model }: Field.Props = $props();
</script>

<Action
  {node}
  {model}
  onclick={() => actions.optOut(node, model)}
  action="opt-out">×</Action
>
