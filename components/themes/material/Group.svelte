<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /** A titled group of fields: objects, arrays, tuples and variants. */
  let {
    node,
    model,
    children,
  }: { node: RenderNode; model: SchemaModel; children: Snippet } = $props();

  const nested = $derived(node.path !== "");
</script>

<fieldset class="group" class:nested>
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
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  .nested {
    padding: var(--sc-spacing) calc(var(--sc-spacing) * 1.25);
    border: 1px solid var(--sc-border);
    border-radius: var(--sc-radius);
  }

  legend {
    padding: 0 0.35em;
    margin-left: -0.35em;
    font-weight: 600;
  }

  .group:not(.nested) > legend {
    font-size: 1.15em;
    margin-bottom: calc(var(--sc-spacing) / 2);
  }

  .description {
    margin: 0 0 var(--sc-spacing);
    color: var(--sc-muted);
    font-size: 0.9em;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 1.25);
  }
</style>
