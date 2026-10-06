<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions, title } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<Button {node} action="opt-in" onclick={() => actions.optIn(node, model)}>
  <span aria-hidden="true" class="plus">+</span>
  {title(node, model)}
</Button>

<style>
  .plus {
    font-size: 1.35em;
    line-height: 0;
  }
</style>
