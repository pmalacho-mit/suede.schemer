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
  }

  .inline label {
    flex-direction: row;
    align-items: center;
    gap: calc(var(--sc-spacing) * 0.75);
  }

  .inline .description {
    padding-left: calc(2.3em + var(--sc-spacing) * 0.75);
  }

  .name {
    font-weight: 500;
    font-size: 0.93em;
  }

  .description {
    color: var(--sc-muted);
    font-size: 0.86em;
  }

  .field :global(:is(input:not([type="checkbox"]), select)) {
    box-sizing: border-box;
    width: 100%;
    height: 2.5em;
    padding: 0 0.85em;
    font: inherit;
    color: inherit;
    background: var(--sc-surface);
    border: 1px solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
    transition:
      border-color 120ms,
      box-shadow 120ms;
  }

  .field :global(:is(input, select):focus-visible) {
    outline: none;
    border-color: var(--sc-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc-accent) 18%, transparent);
  }

  /* a const in edit mode: there, but not for changing */
  .field :global(:is(input:not([type="checkbox"]), select):disabled) {
    cursor: not-allowed;
    color: var(--sc-muted);
    background: color-mix(in srgb, var(--sc-border) 35%, var(--sc-surface));
  }

  /* view and stream modes: read-only throughout, so values read as content */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .field
    :global(:is(input:not([type="checkbox"]), select)) {
    height: auto;
    padding: 0;
    color: var(--sc-text);
    background: none;
    border-color: transparent;
    box-shadow: none;
    appearance: none;
    cursor: default;
  }
</style>
