<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions, title } from "../../defaults/common.js";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  let { node, model }: Field.Props = $props();
</script>

<Button
  {node}
  action="opt-in"
  variant="outlined"
  onclick={() => actions.optIn(node, model)}
>
  <Icon name="add" />
  {title(node, model)}
</Button>
