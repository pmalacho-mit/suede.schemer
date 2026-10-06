<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.Props = $props();

  const group = $derived(
    node.kind === "object" ||
      node.kind === "array" ||
      node.kind === "tuple" ||
      node.kind === "oneOf",
  );
</script>

<!-- a group's sits in its panel's top border; a field's at the end of its control -->
<div class="corner" class:group>
  <Button
    {node}
    action="opt-out"
    variant="danger"
    onclick={() => actions.optOut(node, model)}
  >
    unset
  </Button>
</div>

<style>
  .corner {
    position: absolute;
    top: 0;
    /* a control ends 66ch in (2ch indent + 64ch), counted in this smaller font */
    left: min(100%, calc(66ch / 0.85));
    z-index: 1;
    font-size: 0.85em;
    transform: translateX(-100%);
  }

  .group {
    left: auto;
    right: 1ch;
    padding: 0 0.5ch;
    background: var(--sc-background);
    transform: none;
  }
</style>
