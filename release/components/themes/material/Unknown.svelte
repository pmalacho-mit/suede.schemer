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
    padding: 0.75em 1em;
    font-size: 0.875em;
    line-height: 1.43;
    color: var(--sc-muted);
    background: var(--sc-md-container);
    border-left: 3px solid var(--sc-border);
    border-radius: var(--sc-radius);
  }

  strong {
    font-weight: 500;
    color: var(--sc-text);
  }
</style>
