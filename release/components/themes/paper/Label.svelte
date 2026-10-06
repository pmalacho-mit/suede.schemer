<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /**
   * A labelled control, set like a printed form: the title in small caps
   * beside (or, when narrow, above) the ruled line its value sits on.
   */
  let {
    node,
    model,
    check = false,
    item = false,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** the control is a checkbox: a box before its title when narrow */
    check?: boolean;
    /** an array's item: its list number stands in for the title, which only assistive tech reads */
    item?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="field" class:check class:item>
  <label>
    <span class="name" title={tooltip(node, model)} {...attributes.role("name")}>
      {title(node, model)}
    </span>
    {@render children()}
  </label>
  <!-- outside the label, so the field's accessible name is its title alone -->
  {#if node.description}
    <!-- the note's indent is measured at the label's size, so it lines up with the value -->
    <div class="note">
      <small class="description" {...attributes.role("description")}>
        {node.description}
      </small>
    </div>
  {/if}
</div>

<style>
  .field {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: 0.15em;
    min-width: 0;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.05em;
  }

  .name {
    font-size: 1.14em;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.065em;
    line-height: 1.35;
    color: color-mix(in srgb, var(--sc-text) 80%, var(--sc-background));
    overflow-wrap: anywhere;
  }

  .description {
    display: block;
    font-size: 0.9em;
    font-style: italic;
    line-height: 1.4;
    color: var(--sc-muted);
  }

  /* a checkbox: the box, then its title, on one line */
  .check label {
    flex-direction: row;
    align-items: center;
    gap: 0.6em;
  }

  .check .name {
    order: 1;
  }

  .check .note {
    padding-left: 1.6em;
  }

  /* an array's item: numbered by its list, so the title steps aside */
  .item .name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* room enough: titles in a column of their own, values on lines beside them */
  @container (min-width: 26em) {
    label,
    .check label {
      display: grid;
      grid-template-columns: var(--sc-paper-label-width) minmax(0, 1fr);
      column-gap: var(--sc-spacing);
      align-items: baseline;
    }

    .check label {
      align-items: center;
    }

    .check .name {
      order: 0;
    }

    .note,
    .check .note {
      padding-left: calc(var(--sc-paper-label-width) + var(--sc-spacing));
    }

    .item label {
      grid-template-columns: minmax(0, 1fr);
    }

    .item .note {
      padding-left: 0;
    }
  }

  /* the ruled line a value is written on */
  .field :global(:is(input:not([type="checkbox"]), select)) {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    height: 2em;
    margin: 0;
    padding: 0.2em 0.15em 0;
    font: inherit;
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--sc-text);
    -webkit-text-fill-color: currentColor;
    background-color: transparent;
    border: 0;
    border-bottom: 1px solid var(--sc-paper-rule);
    border-radius: 0;
    box-shadow: none;
  }

  .field :global(input[type="number"]) {
    appearance: textfield;
  }

  .field :global(input[type="number"]::-webkit-inner-spin-button),
  .field :global(input[type="number"]::-webkit-outer-spin-button) {
    appearance: none;
    margin: 0;
  }

  .field :global(input::-webkit-calendar-picker-indicator) {
    opacity: 0.45;
    cursor: pointer;
  }

  /* a select keeps the line, with a small drawn caret at its end */
  .field :global(select) {
    appearance: none;
    padding-right: 1.5em;
    text-overflow: ellipsis;
    cursor: pointer;
    background-image:
      linear-gradient(45deg, transparent 50%, var(--sc-muted) 50%),
      linear-gradient(135deg, var(--sc-muted) 50%, transparent 50%);
    background-position:
      calc(100% - 0.75em) 58%,
      calc(100% - 0.45em) 58%;
    background-size:
      0.3em 0.3em,
      0.3em 0.3em;
    background-repeat: no-repeat;
  }

  .field :global(:is(input:not([type="checkbox"]), select):enabled:hover) {
    border-bottom-color: var(--sc-text);
  }

  .field :global(:is(input:not([type="checkbox"]), select):focus-visible) {
    outline: none;
    border-bottom-color: var(--sc-accent);
    box-shadow: 0 1px 0 var(--sc-accent);
    background-color: color-mix(in srgb, var(--sc-accent) 5%, transparent);
  }

  /* a const in edit mode: printed on the form, not for filling in */
  .field :global(:is(input:not([type="checkbox"]), select):disabled) {
    cursor: not-allowed;
    font-style: italic;
    color: var(--sc-muted);
    border-bottom-style: dotted;
    border-bottom-color: var(--sc-muted);
    opacity: 1;
  }

  /* view and stream modes: the form, filled in and printed */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(:is(input:not([type="checkbox"]), select)) {
    height: auto;
    padding: 0.2em 0 0.15em;
    font-style: normal;
    color: var(--sc-text);
    border-bottom: 1px solid var(--sc-border);
    background-image: none;
    cursor: default;
    text-overflow: clip;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(input::-webkit-calendar-picker-indicator) {
    display: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .field :global(:is(input:not([type="checkbox"]), select)) {
      transition:
        border-color 140ms ease,
        box-shadow 140ms ease,
        background-color 140ms ease;
    }
  }
</style>
