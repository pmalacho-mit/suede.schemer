<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions, title } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<!-- an absent optional field: a command to set it -->
<div class="unset">
  <Button
    {node}
    action="opt-in"
    variant="quiet"
    onclick={() => actions.optIn(node, model)}
  >
    <span aria-hidden="true">+</span>
    {title(node, model)}
  </Button>
</div>

<style>
  .unset {
    display: flex;
    margin-left: -0.5ch;
  }
</style>
