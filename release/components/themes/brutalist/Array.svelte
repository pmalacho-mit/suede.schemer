<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import ArrayAction from "../../ArrayAction.svelte";
  import { arrayItemAtIndex } from "../../naming.js";
  import { array } from "../../defaults/common.js";
  import Group from "./Group.svelte";

  let {
    node,
    model,
    parent,
    renderChild,
    pushRenderer,
    spliceRenderer,
    insertRenderer,
  }: Field.Props<"array"> = $props();

  const items = $derived(array.items(node, model));
  const addable = $derived(array.addable(node, model));
</script>

<Group {node} {model} {parent}>
  {#if items.length === 0}
    <p class="empty">Nothing here yet.</p>
  {/if}

  <ol class="items">
    {#each items as _, index (index)}
      <li class="item">
        {#if addable}
          <div class="insert">
            <ArrayAction
              action="insert"
              renderer={insertRenderer}
              {node}
              {model}
              {index}
            />
          </div>
        {/if}
        <div class="content">
          {@render renderChild(arrayItemAtIndex(node, index), "array", index)}
        </div>
        {#if model.editable}
          <div class="remove">
            <ArrayAction
              action="splice"
              renderer={spliceRenderer}
              {node}
              {model}
              {index}
            />
          </div>
        {/if}
      </li>
    {/each}
  </ol>

  {#if addable}
    <ArrayAction
      action="push"
      renderer={pushRenderer}
      {node}
      {model}
      index={items.length}
    />
  {/if}
</Group>

<style>
  .items {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 1.5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .items:empty {
    display: none;
  }

  /* each item is its own bordered card, a chunky remove button on its right */
  .item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--sc-spacing);
    padding: var(--sc-spacing);
    background: var(--sc-background);
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: var(--sc-shadow) var(--sc-shadow) 0 var(--sc-border);
  }

  .remove {
    display: flex;
    align-self: stretch;
    align-items: flex-end;
  }

  /* insert sits on the seam above its item, shown on hover or focus (always on touch) */
  .insert {
    position: absolute;
    top: calc(var(--sc-spacing) * -0.75 - var(--sc-stroke));
    left: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  .item:hover > .insert,
  .insert:focus-within {
    opacity: 1;
  }

  @media (hover: none) {
    .insert {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .insert {
      transition: opacity 100ms;
    }
  }

  .empty {
    margin: 0;
    padding: 0.7em 1em;
    font-size: 0.85em;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--sc-muted);
    border: var(--sc-stroke) dashed var(--sc-border);
    border-radius: var(--sc-radius);
  }

  /* view and stream modes: items are numbered rows of a printed list */
  :global(:is([data-mode="view"], [data-mode="stream"])) .items {
    gap: var(--sc-spacing);
  }

  :global(:is([data-mode="view"], [data-mode="stream"])) .item {
    padding: calc(var(--sc-spacing) * 0.6) var(--sc-spacing);
    box-shadow: none;
  }

  @media (max-width: 480px) {
    .item {
      gap: calc(var(--sc-spacing) * 0.6);
      padding: calc(var(--sc-spacing) * 0.6);
    }
  }

  .content {
    flex: 1;
    min-width: 0;
  }
</style>
