<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions, title } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();
</script>

<!-- an absent optional field: its title, set like a label, waiting to be added -->
<Button
  {node}
  action="opt-in"
  variant="caps"
  onclick={() => actions.optIn(node, model)}
>
  <span class="mark" aria-hidden="true">+</span>
  {title(node, model)}
  <em class="hint">optional</em>
</Button>

<style>
  .mark {
    font-variant-caps: normal;
    color: var(--sc-accent);
  }

  .hint {
    margin-left: 0.25em;
    font-variant-caps: normal;
    letter-spacing: 0;
    font-size: 0.86em;
    opacity: 0.8;
  }
</style>
