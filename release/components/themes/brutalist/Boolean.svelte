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
  /* a big square box; checked, it fills yellow under a heavy ✕ (drawn, no glyphs) */
  .box {
    --stroke: 0.26em;
    appearance: none;
    flex: none;
    box-sizing: border-box;
    width: 1.9em;
    height: 1.9em;
    margin: 0;
    background-color: var(--sc-surface);
    background-repeat: no-repeat;
    background-position: center;
    background-size: 62% 62%;
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: calc(var(--sc-shadow) * 0.75) calc(var(--sc-shadow) * 0.75) 0
      var(--sc-border);
    cursor: pointer;
  }

  .box:checked {
    background-color: var(--sc-accent);
    background-image: linear-gradient(
        45deg,
        transparent calc(50% - var(--stroke) / 2),
        var(--sc-accent-contrast) calc(50% - var(--stroke) / 2)
          calc(50% + var(--stroke) / 2),
        transparent calc(50% + var(--stroke) / 2)
      ),
      linear-gradient(
        -45deg,
        transparent calc(50% - var(--stroke) / 2),
        var(--sc-accent-contrast) calc(50% - var(--stroke) / 2)
          calc(50% + var(--stroke) / 2),
        transparent calc(50% + var(--stroke) / 2)
      );
  }

  .box:not(:disabled):hover {
    background-color: color-mix(
      in srgb,
      var(--sc-accent) 40%,
      var(--sc-surface)
    );
  }

  .box:checked:not(:disabled):hover {
    background-color: var(--sc-accent);
  }

  .box:not(:disabled):active {
    box-shadow: 0 0 0 var(--sc-border);
    transform: translate(
      calc(var(--sc-shadow) * 0.75),
      calc(var(--sc-shadow) * 0.75)
    );
  }

  .box:focus-visible {
    outline: var(--sc-stroke) solid var(--sc-border);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: no-preference) {
    .box {
      transition:
        transform 70ms ease-out,
        box-shadow 70ms ease-out;
    }
  }

  .box:disabled {
    cursor: default;
  }

  /* in edit mode a disabled box is locked: dashed and flat, still showing its value */
  :global([data-mode="edit"]) .box:disabled {
    cursor: not-allowed;
    border-style: dashed;
    box-shadow: none;
  }
</style>
