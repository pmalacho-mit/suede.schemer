<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model, index }: Field.ArrayActionProps = $props();
</script>

<!-- a proofreader's caret on the seam above an item: insert here -->
<span class="caret">
  <Button
    {node}
    action="insert"
    detail={`at ${index}`}
    onclick={() => actions.insert(node, model, index)}
  >
    <span class="mark" aria-hidden="true">+</span> insert
  </Button>
</span>

<style>
  .caret {
    display: inline-block;
    padding: 0 0.3em;
    font-size: 0.8em;
    background: var(--sc-background);
  }

  .mark {
    font-style: normal;
    color: var(--sc-accent);
  }
</style>
