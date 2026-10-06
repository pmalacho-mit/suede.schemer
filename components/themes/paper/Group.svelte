<script lang="ts" module>
  const depthKey = Symbol("schemer.paper.depth");
</script>

<script lang="ts">
  import { getContext, setContext, type Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /**
   * A titled group of fields: objects, arrays, tuples and variants. The form
   * itself gets a masthead; its sections are set apart by hairline rules; and
   * anything deeper is indented against a thin rule down its left side.
   */
  let {
    node,
    model,
    parent,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** what the group sits in, from Field */
    parent?: "object" | "array" | "oneOf" | "tuple";
    children: Snippet;
  } = $props();

  /** how many groups this one sits in: 0 for the form itself */
  const depth = getContext<number | undefined>(depthKey) ?? 0;
  setContext(depthKey, depth + 1);

  /** an array's item: its list number stands in for the title */
  const item = $derived(parent === "array");
  /** a oneOf's chosen variant: the selector above already names it while editing */
  const variant = $derived(parent === "oneOf");
  const plain = $derived(item || variant);
  const quiet = $derived(item || (variant && model.editable));
</script>

<fieldset
  class="group"
  class:masthead={depth === 0}
  class:section={depth === 1 && !plain}
  class:indented={depth > 1 && !plain}
  class:variant
>
  <legend class:quiet title={tooltip(node, model)} {...attributes.role("name")}>
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

  /* a legend floated into the flow sits under the group's rule, not on it */
  legend {
    float: left;
    width: 100%;
    margin: 0 0 calc(var(--sc-spacing) * 0.5);
    padding: 0;
    font-size: 1.05em;
    font-style: italic;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .description,
  .fields {
    clear: both;
  }

  .description {
    margin: calc(var(--sc-spacing) * -0.3) 0 calc(var(--sc-spacing) * 0.9);
    font-size: 0.95em;
    font-style: italic;
    color: var(--sc-muted);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 1.05);
  }

  /* the form: a masthead over a double rule */
  .masthead > legend {
    margin-bottom: calc(var(--sc-spacing) * 0.45);
    font-size: 1.85em;
    font-style: normal;
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.005em;
  }

  .masthead > .description {
    margin: 0;
    font-size: 1.02em;
  }

  .masthead > .fields {
    margin-top: calc(var(--sc-spacing) * 1.1);
    padding-top: calc(var(--sc-spacing) * 1.6);
    border-top: 3px double var(--sc-paper-rule);
  }

  /* a section: a hairline above, a serif heading */
  .section {
    margin-top: calc(var(--sc-spacing) * 0.4);
    padding-top: calc(var(--sc-spacing) * 1.05);
    border-top: 1px solid var(--sc-border);
  }

  .section > legend {
    margin-bottom: calc(var(--sc-spacing) * 0.7);
    font-size: 1.22em;
    font-style: normal;
    font-weight: 600;
  }

  /* deeper: indented against a thin rule, its heading in italic */
  .indented {
    padding: 0.1em 0 0.25em calc(var(--sc-spacing) * 1.15);
    border-left: 1px solid var(--sc-border);
  }

  .variant > legend {
    font-size: 1em;
    color: var(--sc-muted);
  }

  .quiet {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
