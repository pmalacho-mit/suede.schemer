<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<Button
  {node}
  action="insert"
  detail={`at ${index}`}
  variant="quiet"
  onclick={() => actions.insert(node, model, index)}
>
  <span aria-hidden="true">+</span>
</Button>
