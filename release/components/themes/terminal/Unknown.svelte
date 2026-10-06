<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { title } from "../../defaults/common.js";

  let { node, model }: Field.Props<"unknown"> = $props();
</script>

<!-- a warning line, as a program would print it -->
<p class="unknown">
  <strong>{title(node, model)}</strong> can't be shown: its schema has no type this
  form understands.
</p>

<style>
  .unknown {
    margin: 0;
    padding: 0.4em 1ch;
    color: var(--sc-muted);
    border-left: 2px solid var(--sc-danger);
  }

  .unknown::before {
    content: "warn: ";
    content: "warn: " / "";
    color: var(--sc-danger);
  }

  strong {
    color: var(--sc-text);
  }
</style>
