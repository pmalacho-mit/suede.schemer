<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<Button
  {node}
  action="insert"
  detail={`at ${index}`}
  variant="icon-tonal"
  onclick={() => actions.insert(node, model, index)}
>
  <Icon name="add" />
</Button>
