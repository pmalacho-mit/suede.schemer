<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<div class="corner">
  <Button {node} action="opt-out" variant="icon" onclick={() => actions.optOut(node, model)}>
    <span aria-hidden="true">✕</span>
  </Button>
</div>

<style>
  .corner {
    position: absolute;
    top: -0.35em;
    right: 0;
    z-index: 1;
    font-size: 0.85em;
  }
</style>
