<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import type { Field } from "../../Field.svelte";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /**
   * A titled group of fields: objects, arrays, tuples and variants. The form
   * itself has a headline; a nested group is an outlined card; one that is an
   * array's item or a chosen variant is a tonal card, a step quieter.
   */
  let {
    node,
    model,
    parent,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    parent?: Field.Props["parent"];
    children: Snippet;
  } = $props();

  const style = $derived(
    parent === "array" || parent === "oneOf"
      ? "tonal"
      : node.path === "" && !parent
        ? "form"
        : "outlined",
  );
</script>

<fieldset class="group {style}">
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>
  <!-- below the floated title; padding, unlike a margin, survives the clear -->
  <div class="body">
    {#if node.description}
      <p class="description" {...attributes.role("description")}>
        {node.description}
      </p>
    {/if}
    <div class="fields">
      {@render children()}
    </div>
  </div>
</fieldset>

<style>
  .group {
    /* title to description, and title (or description) to the fields */
    --to-description: 0.125rem;
    --to-fields: calc(var(--sc-spacing) * 0.75);

    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  /* the title sits inside the card, not on its border */
  legend {
    float: left;
    box-sizing: border-box;
    width: 100%;
    padding: 0;
    color: var(--sc-text);
  }

  .body {
    clear: both;
    padding-top: var(--to-description);
  }

  .description {
    margin: 0 0 var(--to-fields);
    font-size: 0.875em;
    line-height: 1.43;
    letter-spacing: 0.018em;
    color: var(--sc-muted);
  }

  .fields:first-child {
    margin-top: calc(var(--to-fields) - var(--to-description));
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--sc-spacing);
  }

  /* the form: a headline */
  .form {
    --to-description: 0.25rem;
    --to-fields: calc(var(--sc-spacing) * 1.5);
  }

  .form > legend {
    font-size: 1.5em;
    line-height: 1.3333;
    font-weight: 400;
    letter-spacing: 0;
  }

  /* a nested group: an outlined card, titled in title-medium */
  .outlined,
  .tonal {
    padding: var(--sc-spacing);
    border-radius: var(--sc-md-card-radius);
  }

  .outlined {
    border: 1px solid var(--sc-md-outline-variant);
  }

  .outlined > legend,
  .tonal > legend {
    /* clear of an opt-out button in the corner */
    padding-right: 2.5em;
    font-size: 1em;
    line-height: 1.5;
    font-weight: 500;
    letter-spacing: 0.009em;
  }

  /* an item or a variant: a tonal card, titled in title-small */
  .tonal {
    background: var(--sc-md-container);
  }

  .tonal > legend {
    font-size: 0.875em;
    line-height: 1.43;
    color: var(--sc-muted);
  }

  /* read-only: an item card trades its fill for an outline, like its parent */
  :global([data-mode]:is([data-mode="view"], [data-mode="stream"])) .tonal {
    background: none;
    border: 1px solid var(--sc-md-outline-variant);
  }

  @media (max-width: 480px) {
    .outlined,
    .tonal {
      padding: calc(var(--sc-spacing) * 0.75);
    }
  }
</style>
