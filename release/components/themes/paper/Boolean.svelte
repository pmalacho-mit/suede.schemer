<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Label from "./Label.svelte";

  let { node, model, parent }: Field.Props<"boolean"> = $props();
</script>

<Label {node} {model} check item={parent === "array"}>
  <input
    type="checkbox"
    class="box"
    checked={model.get(node) ?? false}
    disabled={!model.editable}
    onchange={({ currentTarget: { checked } }) => model.set(node, checked)}
  />
</Label>

<style>
  /* a small printed square, ticked in ink: still a checkbox to forms and screen readers */
  .box {
    appearance: none;
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: 1.08em;
    height: 1.08em;
    margin: 0;
    background: var(--sc-surface);
    border: 1.25px solid var(--sc-text);
    border-radius: 1px;
    cursor: pointer;
  }

  .box::after {
    content: "";
    position: absolute;
    left: 0.33em;
    top: 0.05em;
    width: 0.26em;
    height: 0.6em;
    border: solid var(--sc-text);
    border-width: 0 0.13em 0.13em 0;
    transform: rotate(42deg) scale(0);
    transform-origin: 60% 60%;
  }

  .box:checked::after {
    transform: rotate(42deg) scale(1);
  }

  .box:enabled:hover {
    border-color: var(--sc-accent);
  }

  .box:focus-visible {
    outline: 1.5px solid var(--sc-accent);
    outline-offset: 2px;
  }

  .box:disabled {
    cursor: default;
  }

  :global([data-mode="edit"]) .box:disabled {
    cursor: not-allowed;
    border-style: dotted;
    opacity: 0.6;
  }

  @media (prefers-reduced-motion: no-preference) {
    .box::after {
      transition: transform 120ms ease-out;
    }
  }
</style>
