<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<div class="corner">
  <Button {node} action="opt-out" onclick={() => actions.optOut(node, model)}>
    remove
  </Button>
</div>

<style>
  /* in the field's top corner, on the paper so a ruled line runs behind it */
  .corner {
    position: absolute;
    top: -0.3em;
    right: 0;
    z-index: 1;
    padding-left: 0.4em;
    font-size: 0.85em;
    background: var(--sc-background);
  }
</style>
