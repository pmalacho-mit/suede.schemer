<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<Button
  {node}
  action="splice"
  detail={`at ${index}`}
  onclick={() => actions.splice(node, model, index)}
>
  remove
</Button>
