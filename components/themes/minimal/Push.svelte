<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<Button
  {node}
  action="push"
  variant="outline"
  onclick={() => actions.push(node, model)}
>
  <span aria-hidden="true">+</span> Add item
</Button>
