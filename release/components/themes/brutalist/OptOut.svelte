<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<div class="corner">
  <Button {node} action="opt-out" variant="mini" onclick={() => actions.optOut(node, model)}>
    <span aria-hidden="true">✕</span>
  </Button>
</div>

<style>
  /* a small yellow tab pinned to the field's top-right corner */
  .corner {
    position: absolute;
    top: -0.55em;
    right: 0;
    z-index: 2;
  }
</style>
