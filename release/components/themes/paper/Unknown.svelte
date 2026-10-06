<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { title } from "../../defaults/common.js";

  let { node, model }: Field.Props<"unknown"> = $props();
</script>

<p class="unknown">
  <span class="name">{title(node, model)}</span> can't be shown: its schema has no
  type this form understands.
</p>

<style>
  /* an editor's marginal note */
  .unknown {
    margin: 0;
    padding: 0.15em 0 0.15em 0.9em;
    font-size: 0.92em;
    font-style: italic;
    color: var(--sc-muted);
    border-left: 2px solid color-mix(in srgb, var(--sc-accent) 55%, transparent);
  }

  .name {
    font-style: normal;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    color: var(--sc-text);
  }
</style>
