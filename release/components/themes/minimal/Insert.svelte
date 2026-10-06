<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<div class="pill">
  <Button
    {node}
    action="insert"
    detail={`at ${index}`}
    onclick={() => actions.insert(node, model, index)}
  >
    <span aria-hidden="true">+</span>
  </Button>
</div>

<style>
  .pill {
    font-size: 0.8em;
    background: var(--sc-background);
    border: 1px solid var(--sc-border);
    border-radius: 999px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  }

  .pill :global(button) {
    height: 1.8em;
    width: 1.8em;
    padding: 0;
    border-radius: 999px;
  }
</style>
