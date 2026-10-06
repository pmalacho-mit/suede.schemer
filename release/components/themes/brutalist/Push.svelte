<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<div class="push">
  <Button
    {node}
    action="push"
    variant="primary"
    onclick={() => actions.push(node, model)}
  >
    <span aria-hidden="true" class="plus">+</span> Add item
  </Button>
</div>

<style>
  .push {
    display: flex;
  }

  .plus {
    font-size: 1.35em;
    line-height: 0;
  }
</style>
