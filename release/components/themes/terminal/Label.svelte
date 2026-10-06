<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /** A labelled control: the field's name as a prompt, the control, and its description as a comment. */
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
    <span class="name" title={tooltip(node, model)} {...attributes.role("name")}>
      {title(node, model)}
    </span>
    {#if !inline}
      <!-- the brackets around the control are drawn, not text: the label reads as the title alone -->
      <span class="control">{@render children()}</span>
    {/if}
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
    gap: calc(var(--sc-spacing) / 4);
    min-width: 0;
  }

  /* narrow fields (a phone, or deep nesting) stack their printed name and value */
  .field {
    container-type: inline-size;
  }

  .inline label {
    flex-direction: row;
    align-items: center;
    gap: 1ch;
    align-self: flex-start;
  }

  .name {
    font-weight: 600;
    color: var(--sc-text);
    overflow-wrap: anywhere;
  }

  /* the prompt: drawn, and given empty alt text so it is never read out */
  .name::before {
    content: var(--sc-prompt) " ";
    content: var(--sc-prompt) " " / "";
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
  }

  .inline .name {
    font-weight: 500;
  }

  .inline .name::before {
    content: none;
  }

  /* a description is a comment */
  .description {
    padding-left: 2ch;
    font-size: 0.92em;
    color: var(--sc-muted);
  }

  .description::before {
    content: "# ";
    content: "# " / "";
    opacity: 0.7;
  }

  .inline .description {
    padding-left: 4ch;
  }

  /* [ the control ] */
  .control {
    display: flex;
    align-items: center;
    gap: 0.5ch;
    max-width: 64ch;
    padding-left: 2ch;
    color: var(--sc-muted);
  }

  .control::before {
    content: "[";
    content: "[" / "";
  }

  .control::after {
    content: "]";
    content: "]" / "";
  }

  .control:has(:global(select))::after {
    content: "▾ ]";
    content: "▾ ]" / "";
  }

  .control:focus-within {
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
  }

  .control :global(:is(input, select)) {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    height: 1.9em;
    margin: 0;
    padding: 0 0.75ch;
    font: inherit;
    color: var(--sc-text);
    text-shadow: none;
    background: transparent;
    border: 0;
    border-bottom: 1px dashed var(--sc-border);
    border-radius: 0;
    caret-color: var(--sc-accent);
    caret-shape: block;
    appearance: none;
    cursor: text;
  }

  .control :global(select) {
    cursor: pointer;
  }

  .control :global(option) {
    color: var(--sc-text);
    background: var(--sc-surface);
  }

  .control :global(:is(input, select):hover) {
    border-bottom-color: var(--sc-muted);
  }

  .control :global(:is(input, select):focus-visible) {
    outline: none;
    background: color-mix(in srgb, var(--sc-accent) 9%, transparent);
    border-bottom: 1px solid var(--sc-accent);
  }

  .control :global(input::-webkit-calendar-picker-indicator) {
    opacity: 0.55;
    cursor: pointer;
  }

  .control :global(input::placeholder) {
    color: var(--sc-muted);
  }

  /* a const in edit mode: locked, and says so */
  .control :global(:is(input, select):disabled) {
    color: var(--sc-muted);
    border-bottom-style: dotted;
    cursor: not-allowed;
  }

  :global([data-mode="edit"]) .control:has(:global(:is(input, select):disabled))::after {
    content: "] ro";
    content: "] ro" / "";
  }

  :global([data-mode="edit"]) .control:has(:global(:is(input, select):disabled))::before {
    opacity: 0.6;
  }

  /*
    view and stream modes: printed output. `name  value`, no prompts, no
    brackets; the values are content, not disabled inputs.
  */
  :global(:is([data-mode="view"], [data-mode="stream"])) label {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 2ch;
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .name {
    flex: 0 0 18ch;
    font-weight: 400;
    color: var(--sc-muted);
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .name::before {
    content: none;
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .name::after {
    content: ":";
    content: ":" / "";
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .control {
    flex: 1 1 16ch;
    max-width: none;
    padding-left: 0;
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .control::before,
  :global(:is([data-mode="view"], [data-mode="stream"])) .control::after {
    content: none;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .control
    :global(:is(input, select)) {
    height: auto;
    padding: 0;
    color: var(--sc-text);
    border: 0;
    opacity: 1;
    cursor: default;
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .description {
    /* under the value: the name column (18ch + 2ch gap), in the description's smaller ch */
    padding-left: calc(20ch / 0.92);
  }

  @container (max-width: 44ch) {
    :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .name {
      flex-basis: 100%;
    }

    :global(:is([data-mode="view"], [data-mode="stream"])) .field:not(.inline) .description {
      padding-left: 0;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .control :global(:is(input, select)) {
      transition:
        background 100ms,
        border-color 100ms;
    }
  }
</style>
