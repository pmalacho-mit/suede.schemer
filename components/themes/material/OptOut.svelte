<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";
  import Icon from "./Icon.svelte";

  let { node, model }: Field.Props = $props();
</script>

<!-- md-opt-out: the container keeps a text field's value clear of it -->
<div class="md-opt-out corner">
  <Button
    {node}
    action="opt-out"
    variant="icon"
    onclick={() => actions.optOut(node, model)}
  >
    <Icon name="close" />
  </Button>
</div>

<style>
  /* in the field's top-right corner: inside a filled field, or a card */
  .corner {
    position: absolute;
    top: 0.5em;
    right: 0.25em;
    z-index: 1;
  }
</style>
