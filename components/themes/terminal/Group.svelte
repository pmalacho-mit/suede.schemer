<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /**
   * A titled group of fields, drawn as a TUI panel with its title set into
   * the top border: objects and variants in a solid frame, arrays and tuples
   * in a dashed one. The form itself is the screen, with its title as a banner.
   */
  let {
    node,
    model,
    flat = false,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** no frame of its own (a variant, already inside its oneOf's panel) */
    flat?: boolean;
    children: Snippet;
  } = $props();

  const root = $derived(node.path === "");
  const list = $derived(node.kind === "array" || node.kind === "tuple");
</script>

<fieldset
  class="group"
  class:root
  class:panel={!root && !flat}
  class:list
  class:flat
>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>
  {#if node.description}
    <p class="description" {...attributes.role("description")}>
      {node.description}
    </p>
  {/if}
  <div class="fields">
    {@render children()}
  </div>
</fieldset>

<style>
  .group {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    padding: 0;
    font-weight: 700;
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
    overflow-wrap: anywhere;
  }

  .description {
    margin: 0 0 var(--sc-spacing);
    font-size: 0.92em;
    color: var(--sc-muted);
  }

  .description::before {
    content: "# ";
    content: "# " / "";
    opacity: 0.7;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 1.1);
    min-width: 0;
  }

  /* the screen: a banner, its comment, then a rule */
  .root > legend {
    margin-bottom: calc(var(--sc-spacing) / 3);
    font-size: 1.12em;
    letter-spacing: 0.01em;
  }

  .root > legend::before {
    content: "$ ";
    content: "$ " / "";
    color: var(--sc-muted);
    text-shadow: none;
  }

  .root > .fields {
    padding-top: calc(var(--sc-spacing) * 1.25);
    border-top: 1px dashed var(--sc-border);
  }

  .root > .description {
    margin-bottom: calc(var(--sc-spacing) * 1.25);
  }

  /* ┌─[ Title ]──────┐ */
  .panel {
    padding: calc(var(--sc-spacing) * 0.6) calc(var(--sc-spacing) * 1.1)
      calc(var(--sc-spacing) * 1.1);
    border: 1px solid var(--sc-border);
    border-radius: var(--sc-radius);
  }

  .panel.list {
    border-style: dashed;
  }

  .panel > legend {
    margin-left: -0.5ch;
    padding: 0 0.5ch;
  }

  .panel > legend::before {
    content: "[ ";
    content: "[ " / "";
    color: var(--sc-muted);
    text-shadow: none;
  }

  .panel > legend::after {
    content: " ]";
    content: " ]" / "";
    color: var(--sc-muted);
    text-shadow: none;
  }

  .panel:focus-within {
    border-color: color-mix(in srgb, var(--sc-accent) 45%, var(--sc-border));
  }

  /*
    a variant, inside its oneOf's panel: in edit mode the variant selector
    already names it; in view and stream modes it prints as `Type: Card`
  */
  .flat > legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .flat > legend {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
    margin-bottom: calc(var(--sc-spacing) * 1.1);
    font-weight: 400;
    color: var(--sc-text);
    text-shadow: none;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .flat
    > legend::before {
    content: "Type:";
    content: "Type:" / "";
    display: inline-block;
    width: 20ch;
    color: var(--sc-muted);
  }
</style>
