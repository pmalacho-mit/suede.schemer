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
  variant="remove"
  onclick={() => actions.splice(node, model, index)}
>
  <span aria-hidden="true" class="cross">✕</span>
</Button>

<style>
  .cross {
    font-size: 1.15em;
    font-weight: 900;
  }
</style>
