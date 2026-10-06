<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /** A labelled control: the field's title, the control, and its description. */
  let {
    node,
    model,
    inline = false,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** the control before the title, on one line (a checkbox) */
    inline?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="field" class:inline>
  <label>
    {#if inline}{@render children()}{/if}
    <span
      class="name"
      title={tooltip(node, model)}
      {...attributes.role("name")}
    >
      {title(node, model)}
    </span>
    {#if !inline}{@render children()}{/if}
  </label>
  <!-- outside the label, so the field's accessible name is its title alone -->
  {#if node.description}
    <small class="description" {...attributes.role("description")}>
      {node.description}
    </small>
  {/if}
</div>

<style>
  .field,
  label {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) / 2);
    min-width: 0;
  }

  .inline label {
    flex-direction: row;
    align-items: center;
    gap: calc(var(--sc-spacing) * 0.85);
    align-self: flex-start;
    cursor: pointer;
  }

  .inline .description {
    padding-left: calc(1.9em + var(--sc-spacing) * 0.85);
  }

  .name {
    font-size: 0.78em;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .inline .name {
    font-size: 0.85em;
  }

  .description {
    color: var(--sc-muted);
    font-size: 0.85em;
    font-weight: 500;
  }

  /* text-like controls and selects: a white slab with a hard shadow */
  .field :global(:is(input:not([type="checkbox"]), select)) {
    box-sizing: border-box;
    width: 100%;
    height: 2.75em;
    margin: 0;
    padding: 0 0.85em;
    font: inherit;
    font-weight: 500;
    color: var(--sc-text);
    background-color: var(--sc-surface);
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: var(--sc-shadow) var(--sc-shadow) 0 var(--sc-border);
  }

  /* a select's arrow: a drawn chevron behind a heavy rule, no images */
  .field :global(select) {
    appearance: none;
    padding-right: 3.4em;
    cursor: pointer;
    background-image: linear-gradient(
        45deg,
        transparent 50%,
        var(--sc-accent-contrast) 50%
      ),
      linear-gradient(135deg, var(--sc-accent-contrast) 50%, transparent 50%),
      linear-gradient(var(--sc-border), var(--sc-border)),
      linear-gradient(var(--sc-accent), var(--sc-accent));
    background-position:
      calc(100% - 1.25em) 52%,
      calc(100% - 0.8em) 52%,
      calc(100% - 2.5em) 0,
      100% 0;
    background-size:
      0.45em 0.45em,
      0.45em 0.45em,
      var(--sc-stroke) 100%,
      2.5em 100%;
    background-repeat: no-repeat;
  }

  .field :global(select:not(:disabled):hover) {
    background-color: color-mix(
      in srgb,
      var(--sc-accent) 35%,
      var(--sc-surface)
    );
  }

  /* focus: the slab lifts off the page and lights up */
  .field :global(:is(input:not([type="checkbox"]), select):focus-visible) {
    outline: none;
    color: var(--sc-accent-contrast);
    background-color: var(--sc-accent);
    box-shadow: calc(var(--sc-shadow) * 1.5) calc(var(--sc-shadow) * 1.5) 0
      var(--sc-border);
    transform: translate(
      calc(var(--sc-shadow) * -0.5),
      calc(var(--sc-shadow) * -0.5)
    );
  }

  @media (prefers-reduced-motion: no-preference) {
    .field :global(:is(input:not([type="checkbox"]), select)) {
      transition:
        transform 90ms ease-out,
        box-shadow 90ms ease-out,
        background-color 90ms;
    }
  }

  /* a const in edit mode: hatched, flat and pressed in, plainly locked */
  .field :global(:is(input:not([type="checkbox"]), select):disabled) {
    cursor: not-allowed;
    color: var(--sc-muted);
    border-style: dashed;
    box-shadow: none;
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0 7px,
      color-mix(in srgb, var(--sc-border) 14%, transparent) 7px 9px
    );
  }

  /* view and stream modes: a spec sheet, the title left and the value in bold */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field:not(.inline)
    label {
    flex-flow: row wrap;
    align-items: baseline;
    column-gap: var(--sc-spacing);
    row-gap: 0.15em;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field:not(.inline)
    .name {
    flex: 0 0 calc(var(--sc-font-size) * 9);
    color: var(--sc-muted);
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(:is(input:not([type="checkbox"]), select)) {
    flex: 1 1 12em;
    width: auto;
    min-width: 0;
    height: auto;
    padding: 0;
    font-size: 1.15em;
    font-weight: 800;
    text-overflow: ellipsis;
    color: var(--sc-text);
    opacity: 1;
    background: none;
    border: 0;
    box-shadow: none;
    appearance: none;
    cursor: default;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(input::-webkit-calendar-picker-indicator) {
    display: none;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(input[type="number"]) {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(input::-webkit-inner-spin-button) {
    display: none;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field:not(.inline)
    .description {
    padding-left: calc(var(--sc-font-size) * 9 + var(--sc-spacing));
  }

  @media (max-width: 480px) {
    :global(:is([data-mode="view"], [data-mode="stream"]))
      .field:not(.inline)
      .description {
      padding-left: 0;
    }

    :global(:is([data-mode="view"], [data-mode="stream"]))
      .field
      :global(:is(input:not([type="checkbox"]), select)) {
      font-size: 1.05em;
    }
  }
</style>
