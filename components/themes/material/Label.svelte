<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /**
   * A labelled control. By default an MD3 filled field: the label is the
   * field's tonal box, its title small inside the top, the control below it.
   * `inline` lays the title and a switch out on one row instead.
   */
  let {
    node,
    model,
    inline = false,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** the title, then the control at the row's end (a switch) */
    inline?: boolean;
    children: Snippet;
  } = $props();
</script>

<div class="md-field field" class:inline>
  <label class={inline ? "row" : "md-box box"}>
    <span
      class="name"
      title={tooltip(node, model)}
      {...attributes.role("name")}
    >
      {title(node, model)}
    </span>
    {@render children()}
  </label>
  <!-- outside the label, so the field's accessible name is its title alone -->
  {#if node.description}
    <small class="description" {...attributes.role("description")}>
      {node.description}
    </small>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  /* ---- the filled field ------------------------------------------------ */

  .box {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    min-height: 3.5em;
    padding: 0.5em var(--sc-md-inset);
    background: var(--sc-surface);
    border-radius: var(--sc-radius) var(--sc-radius) 0 0;
    box-shadow: inset 0 -1px 0 var(--sc-border);
    cursor: text;
  }

  .box .name {
    font-size: 0.75em;
    line-height: 1.3333;
    letter-spacing: 0.025em;
    color: var(--sc-muted);
  }

  /* the state layer: a tint of the text colour over the fill */
  .box:hover {
    background: color-mix(in srgb, var(--sc-text) 8%, var(--sc-surface));
    box-shadow: inset 0 -1px 0 var(--sc-text);
  }

  /* focus: the indicator thickens and takes the accent, as does the label */
  .box:focus-within {
    box-shadow: inset 0 -2px 0 var(--sc-accent);
  }

  .box:focus-within .name {
    color: var(--sc-accent);
  }

  .box :global(:is(input, select)) {
    box-sizing: border-box;
    width: 100%;
    height: 1.5em;
    margin: 0;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    color: var(--sc-text);
    -webkit-text-fill-color: var(--sc-text);
    opacity: 1;
    background: transparent;
    border: 0;
    border-radius: 0;
    caret-color: var(--sc-accent);
  }

  .box :global(:is(input, select):focus-visible) {
    /* the thick accent underline above is the focus indicator */
    outline: none;
  }

  /* selects match: same box, a drawn caret in place of the native arrow */
  .box:has(> :global(select)) {
    cursor: pointer;
  }

  .box :global(select) {
    appearance: none;
    padding-right: 2em;
    cursor: pointer;
  }

  .box :global(select option) {
    color: var(--sc-text);
    background: var(--sc-background);
  }

  .box:has(> :global(select))::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 1em;
    border: 0.3125em solid transparent;
    border-top-color: var(--sc-muted);
    border-bottom-width: 0;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .box:has(> :global(select)):focus-within::after {
    border-top-color: var(--sc-accent);
  }

  /* a const in edit mode: dimmed, with a lock where the caret would be */
  :global([data-mode="edit"]) .box:has(> :global(:disabled)) {
    --locked: color-mix(in srgb, var(--sc-text) 38%, transparent);
    cursor: not-allowed;
    background: color-mix(in srgb, var(--sc-text) 4%, transparent);
    box-shadow: inset 0 -1px 0 var(--locked);
  }

  :global([data-mode="edit"]) .box:has(> :global(:disabled)) :global(*) {
    color: var(--locked);
    -webkit-text-fill-color: var(--locked);
    cursor: not-allowed;
  }

  :global([data-mode="edit"]) .box:has(> :global(:disabled))::before,
  :global([data-mode="edit"]) .box:has(> :global(:disabled))::after {
    content: "";
    position: absolute;
    top: 50%;
    pointer-events: none;
  }

  /* shackle */
  :global([data-mode="edit"]) .box:has(> :global(:disabled))::before {
    right: 1.15em;
    width: 0.45em;
    height: 0.4em;
    margin-top: -0.55em;
    border: 0.125em solid var(--locked);
    border-bottom: 0;
    border-radius: 0.3em 0.3em 0 0;
  }

  /* body */
  :global([data-mode="edit"]) .box:has(> :global(:disabled))::after {
    right: 1em;
    width: 0.95em;
    height: 0.65em;
    margin-top: -0.05em;
    background: var(--locked);
    border: 0;
    border-radius: 0.15em;
    transform: none;
  }

  /* view and stream modes: no fill, no line, the value reads as content */
  :global([data-mode]:is([data-mode="view"], [data-mode="stream"])) .box {
    min-height: 0;
    padding-block: 0;
    background: none;
    box-shadow: none;
    cursor: default;
  }

  :global([data-mode]:is([data-mode="view"], [data-mode="stream"]))
    .box::after {
    display: none;
  }

  :global([data-mode]:is([data-mode="view"], [data-mode="stream"]))
    .box
    :global(:is(input, select)) {
    height: auto;
    padding-right: 0;
    cursor: default;
    appearance: none;
    -moz-appearance: textfield;
  }

  :global([data-mode]:is([data-mode="view"], [data-mode="stream"]))
    .box
    :global(input::-webkit-calendar-picker-indicator),
  :global([data-mode]:is([data-mode="view"], [data-mode="stream"]))
    .box
    :global(input::-webkit-inner-spin-button) {
    display: none;
  }

  /* ---- a switch row ---------------------------------------------------- */

  .row {
    display: flex;
    align-items: center;
    gap: var(--sc-spacing);
    min-height: 3em;
    padding: 0 var(--sc-md-inset);
    cursor: pointer;
  }

  .row .name {
    flex: 1;
    min-width: 0;
  }

  .inline .description {
    margin-top: -0.35em;
    padding-right: 4.5em;
  }

  /* ---- supporting text ------------------------------------------------- */

  .description {
    /* the inset is in the field's ems; this text is 0.75 of that size */
    padding: 0.33em calc(var(--sc-md-inset) / 0.75) 0;
    font-size: 0.75em;
    line-height: 1.3333;
    letter-spacing: 0.025em;
    color: var(--sc-muted);
  }

  @media (prefers-reduced-motion: no-preference) {
    .box {
      transition:
        background-color 150ms,
        box-shadow 150ms;
    }

    .box .name {
      transition: color 150ms;
    }
  }
</style>
