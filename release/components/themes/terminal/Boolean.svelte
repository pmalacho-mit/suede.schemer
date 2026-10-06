<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import Label from "./Label.svelte";

  let { node, model }: Field.Props<"boolean"> = $props();
</script>

<Label {node} {model} inline>
  <input
    type="checkbox"
    class="switch"
    checked={model.get(node) ?? false}
    disabled={!model.editable}
    onchange={({ currentTarget: { checked } }) => model.set(node, checked)}
  />
</Label>

<style>
  /* a checkbox drawn as a switch: still a checkbox to forms and screen readers */
  .switch {
    appearance: none;
    position: relative;
    flex: none;
    width: 2.3em;
    height: 1.3em;
    margin: 0;
    border-radius: 999px;
    background: var(--sc-border);
    cursor: pointer;
    transition: background 150ms;
  }

  .switch::after {
    content: "";
    position: absolute;
    top: 0.15em;
    left: 0.15em;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background: var(--sc-background);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.25);
    transition: transform 150ms;
  }

  .switch:checked {
    background: var(--sc-accent);
  }

  .switch:checked::after {
    transform: translateX(1em);
  }

  .switch:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
  }

  .switch:disabled {
    cursor: default;
  }

  :global([data-mode="edit"]) .switch:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
</style>
