<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";
  import type { SchemaModel } from "../../../models.svelte.js";
  import { attributes, title, tooltip } from "../../defaults/common.js";

  /** A titled group of fields: objects, arrays, tuples and variants. */
  let {
    node,
    model,
    parent,
    children,
  }: {
    node: RenderNode;
    model: SchemaModel;
    /** what holds this group: inside an array item or a variant it drops its own card */
    parent?: "object" | "array" | "oneOf" | "tuple";
    children: Snippet;
  } = $props();

  const nested = $derived(node.path !== "");
  const flat = $derived(nested && (parent === "array" || parent === "oneOf"));
</script>

<fieldset class="group" class:nested class:card={nested && !flat} class:flat>
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

  /* legends float, so they lay out as ordinary blocks above the fields */
  legend {
    float: left;
    padding: 0;
    font-family: var(--sc-display);
    font-weight: 900;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .description,
  .fields {
    clear: both;
  }

  /* the form's own title: a poster headline over a double-weight rule */
  .group:not(.nested) > legend {
    width: 100%;
    margin-bottom: calc(var(--sc-spacing) * 0.75);
    padding-bottom: calc(var(--sc-spacing) * 0.6);
    font-size: clamp(1.6em, 6vw, 2.6em);
    line-height: 0.98;
    letter-spacing: -0.02em;
    border-bottom: calc(var(--sc-stroke) * 2) solid var(--sc-border);
  }

  .group:not(.nested) > .description {
    margin: 0 0 calc(var(--sc-spacing) * 2);
    font-size: 1em;
    font-weight: 600;
    color: var(--sc-text);
  }

  /* a nested group: a white card with a hard shadow, its title an inverted tab */
  .card {
    padding: 0 calc(var(--sc-spacing) * 1.25) calc(var(--sc-spacing) * 1.5);
    background: var(--sc-surface);
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: calc(var(--sc-shadow) * 1.5) calc(var(--sc-shadow) * 1.5) 0
      var(--sc-border);
  }

  .card > legend {
    margin: 0 0 calc(var(--sc-spacing) * 1.1) calc(var(--sc-spacing) * -1.25);
    padding: 0.4em 0.75em 0.35em;
    font-size: 0.8em;
    letter-spacing: 0.1em;
    line-height: 1.2;
    color: var(--sc-background);
    background: var(--sc-border);
  }

  .card > .description,
  .flat > .description {
    margin: calc(var(--sc-spacing) * -0.4) 0 var(--sc-spacing);
    font-size: 0.88em;
    font-weight: 500;
    color: var(--sc-muted);
  }

  /* inside an array item or a variant: the item is the card, so only a label remains */
  .flat > legend {
    margin-bottom: calc(var(--sc-spacing) * 0.85);
    padding: 0.3em 0.6em 0.25em;
    font-size: 0.74em;
    letter-spacing: 0.12em;
    line-height: 1.2;
    color: var(--sc-accent-contrast);
    background: var(--sc-accent);
    border: calc(var(--sc-stroke) * 0.7) solid var(--sc-border);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 1.4);
  }

  /* view and stream modes: a spec sheet, every row ruled off */
  :global(:is([data-mode="view"], [data-mode="stream"])) .fields {
    gap: 0;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(div[data-kind]) {
    padding-block: calc(var(--sc-spacing) * 0.6);
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(div[data-kind] + div[data-kind]) {
    border-top: calc(var(--sc-stroke) * 0.5) solid var(--sc-border);
  }

  /* an opted-out field draws nothing in view mode: no empty row for it */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(div[data-kind]:empty) {
    display: none;
  }

  /* cards carry their own border: no rule above them or right below them */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(
      div[data-kind]:is(
          [data-kind="object"],
          [data-kind="array"],
          [data-kind="tuple"],
          [data-kind="oneOf"]
        )
    ) {
    border-top: 0;
  }

  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(
      div[data-kind]:is(
          [data-kind="object"],
          [data-kind="array"],
          [data-kind="tuple"],
          [data-kind="oneOf"]
        )
        + div[data-kind]
    ) {
    border-top: 0;
  }

  /* cards in a spec sheet sit on their rule, given room for their shadow */
  :global(:is([data-mode="view"], [data-mode="stream"]))
    .fields
    > :global(
      div:is(
          [data-kind="object"],
          [data-kind="array"],
          [data-kind="tuple"],
          [data-kind="oneOf"]
        )
    ) {
    padding-block: calc(var(--sc-spacing) * 1.25);
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .card {
    box-shadow: var(--sc-shadow) var(--sc-shadow) 0 var(--sc-border);
  }

  @media (max-width: 480px) {
    .card {
      padding: 0 calc(var(--sc-spacing) * 0.75) var(--sc-spacing);
    }

    .card > legend {
      margin-left: calc(var(--sc-spacing) * -0.75);
    }
  }
</style>
