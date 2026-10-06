<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import { actions } from "../../defaults/common.js";
  import Button from "./Button.svelte";

  let { node, model }: Field.ArrayActionProps = $props();
</script>

<div class="push">
  <Button {node} action="push" onclick={() => actions.push(node, model)}>
    <span aria-hidden="true">+</span> add
  </Button>
</div>

<style>
  .push {
    display: flex;
    margin-left: -0.5ch;
  }
</style>
