<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<Button
  {node}
  action="push"
  variant="tonal"
  onclick={() => actions.push(node, model)}
>
  <Icon name="add" /> Add item
</Button>
