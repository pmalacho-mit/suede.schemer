<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<div class="push">
  <Button {node} action="push" onclick={() => actions.push(node, model)}>
    <span class="mark" aria-hidden="true">+</span> add an entry
  </Button>
</div>

<style>
  .push {
    align-self: flex-start;
    margin-left: calc(2.1em - 0.15em);
  }

  .mark {
    font-style: normal;
    color: var(--sc-accent);
  }
</style>
