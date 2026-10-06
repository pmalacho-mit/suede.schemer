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
  /* a warning sticker: hazard-striped edge, bold copy */
  .unknown {
    margin: 0;
    padding: 0.75em 1em 0.75em 1.6em;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--sc-text);
    background:
      repeating-linear-gradient(
          -45deg,
          var(--sc-accent) 0 6px,
          var(--sc-border) 6px 12px
        )
        left / 0.6em 100% no-repeat,
      var(--sc-surface);
    border: var(--sc-stroke) dashed var(--sc-border);
    border-radius: var(--sc-radius);
  }

  strong {
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
</style>
