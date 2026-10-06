<script lang="ts">
  import type { Field } from "../Field.svelte";
  import Action from "./Action.svelte";
  import { actions, title } from "./common.js";

  let { node, model }: Field.Props = $props();
</script>

<Action {node} {model} onclick={() => actions.optIn(node, model)} action="opt-in">
  + {title(node, model)}
</Action>
