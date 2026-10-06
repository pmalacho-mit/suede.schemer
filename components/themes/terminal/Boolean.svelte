<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Label from "./Label.svelte";

  let { node, model }: Field.Props<"boolean"> = $props();
</script>

<Label {node} {model} inline>
  <input
    type="checkbox"
    class="box"
    checked={model.get(node) ?? false}
    disabled={!model.editable}
    onchange={({ currentTarget: { checked } }) => model.set(node, checked)}
  />
</Label>

<style>
  /* a checkbox drawn as [ ] / [x]: still a checkbox to forms and screen readers */
  .box {
    appearance: none;
    display: inline-grid;
    place-items: center;
    flex: none;
    width: 3ch;
    height: 1.55em;
    margin: 0;
    font: inherit;
    color: var(--sc-muted);
    background: transparent;
    border: 0;
    border-radius: 0;
    cursor: pointer;
  }

  .box::after {
    content: "[ ]";
    white-space: pre;
  }

  .box:checked {
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
  }

  .box:checked::after {
    content: "[x]";
  }

  .box:hover:not(:disabled) {
    color: var(--sc-accent);
  }

  .box:focus-visible {
    outline: none;
    color: var(--sc-accent-contrast);
    text-shadow: none;
    background: var(--sc-accent);
  }

  .box:disabled {
    cursor: default;
  }

  /* read-only in edit mode (not in view, where [x] is simply the answer) */
  :global([data-mode="edit"]) .box:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
</style>
