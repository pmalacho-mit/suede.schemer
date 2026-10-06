<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions, title } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<Button {node} action="opt-in" variant="outline" onclick={() => actions.optIn(node, model)}>
  <span aria-hidden="true">+</span>
  {title(node, model)}
</Button>
