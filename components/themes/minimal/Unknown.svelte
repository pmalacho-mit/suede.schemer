<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { title } from "../../defaults/common.js";

  let { node, model }: Field.Props<"unknown"> = $props();
</script>

<p class="unknown">
  <strong>{title(node, model)}</strong> can't be shown: its schema has no type this
  form understands.
</p>

<style>
  .unknown {
    margin: 0;
    padding: 0.6em 0.85em;
    font-size: 0.9em;
    color: var(--sc-muted);
    border: 1px dashed var(--sc-border);
    border-radius: var(--sc-radius);
  }
</style>
