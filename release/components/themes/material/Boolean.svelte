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
  /*
   * An MD3 switch, still a checkbox to forms and screen readers: an outlined
   * track with a small handle when off; a filled track with a larger handle,
   * carrying a check, when on. The handle's halo is the state layer.
   */
  .switch {
    appearance: none;
    position: relative;
    flex: none;
    box-sizing: border-box;
    width: 3.25em;
    height: 2em;
    margin: 0;
    font-size: inherit;
    background: var(--sc-surface);
    border: 0.125em solid var(--sc-border);
    border-radius: 999px;
    cursor: pointer;
  }

  /* the handle */
  .switch::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0.875em;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    background: var(--sc-border);
    transform: translate(-50%, -50%);
  }

  /* the check on the handle, drawn when on */
  .switch::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 2.125em;
    box-sizing: border-box;
    width: 0.375em;
    height: 0.7em;
    border: solid var(--sc-accent);
    border-width: 0 0.125em 0.125em 0;
    opacity: 0;
    transform: translate(-50%, -62%) rotate(45deg);
  }

  .switch:hover::before {
    background: var(--sc-muted);
    box-shadow: 0 0 0 0.75em color-mix(in srgb, var(--sc-text) 8%, transparent);
  }

  .switch:checked {
    background: var(--sc-accent);
    border-color: var(--sc-accent);
  }

  .switch:checked::before {
    left: 2.125em;
    width: 1.5em;
    height: 1.5em;
    background: var(--sc-accent-contrast);
  }

  .switch:checked::after {
    opacity: 1;
  }

  .switch:checked:hover::before {
    background: color-mix(
      in srgb,
      var(--sc-accent) 8%,
      var(--sc-accent-contrast)
    );
    box-shadow: 0 0 0 0.5em
      color-mix(in srgb, var(--sc-accent) 10%, transparent);
  }

  /* pressed: the handle grows */
  .switch:active::before {
    width: 1.75em;
    height: 1.75em;
  }

  .switch:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
  }

  /* read-only (view, stream): unchanged colours, so on still reads as on */
  .switch:disabled {
    cursor: default;
  }

  .switch:disabled::before {
    box-shadow: none;
  }

  .switch:disabled:not(:checked)::before {
    background: var(--sc-border);
  }

  .switch:disabled:checked::before {
    width: 1.5em;
    height: 1.5em;
    background: var(--sc-accent-contrast);
  }

  :global([data-mode="edit"]) .switch:disabled {
    cursor: not-allowed;
    opacity: 0.38;
  }

  @media (prefers-reduced-motion: no-preference) {
    .switch {
      transition:
        background-color 200ms,
        border-color 200ms;
    }

    .switch::before {
      transition:
        left 250ms cubic-bezier(0.2, 0, 0, 1),
        width 250ms cubic-bezier(0.2, 0, 0, 1),
        height 250ms cubic-bezier(0.2, 0, 0, 1),
        background-color 200ms,
        box-shadow 150ms;
    }

    .switch::after {
      transition: opacity 150ms;
    }
  }
</style>
