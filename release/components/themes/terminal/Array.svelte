<script lang="ts">
  import type { Field } from "../../Field.svelte";
  import ArrayAction from "../../ArrayAction.svelte";
  import { arrayItemAtIndex } from "../../naming.js";
  import { array } from "../../defaults/common.js";
  import Group from "./Group.svelte";

  let {
    node,
    model,
    renderChild,
    pushRenderer,
    spliceRenderer,
    insertRenderer,
  }: Field.Props<"array"> = $props();

  const items = $derived(array.items(node, model));
  const addable = $derived(array.addable(node, model));
</script>

<Group {node} {model}>
  {#if items.length === 0}
    <p class="empty">(empty)</p>
  {/if}

  <ol class="items">
    {#each items as _, index (index)}
      <li class="item">
        <span class="index" aria-hidden="true">{index}</span>
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
          <div class="splice">
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
    gap: calc(var(--sc-spacing) * 0.9);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .items:empty {
    display: none;
  }

  /* index │ item [ rm ] */
  .item {
    position: relative;
    display: grid;
    /* items as wide as a control, so [ rm ] sits beside its item */
    grid-template-columns: 3ch minmax(0, 64ch) auto;
    justify-content: start;
    align-items: start;
    column-gap: 1ch;
  }

  .index {
    grid-column: 1;
    grid-row: 1;
    align-self: stretch;
    padding-top: 0.2em;
    padding-right: 1ch;
    font-size: 0.9em;
    text-align: right;
    color: var(--sc-muted);
    border-right: 1px solid var(--sc-border);
  }

  .content {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
  }

  /*
    an item's own title ("Item 1") repeats what the index gutter says: it
    stays the item's accessible name, but is not drawn
  */
  .content > :global(div[data-kind] > div > label > [data-role="name"]),
  .content > :global(div[data-kind] > fieldset > legend) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .content > :global(div[data-kind] > div > label > .control) {
    padding-left: 0;
  }

  .splice {
    grid-column: 3;
    grid-row: 1;
    font-size: 0.85em;
  }

  /* insert sits on the seam above its item, in the index gutter, shown on hover or focus */
  .insert {
    position: absolute;
    top: calc(var(--sc-spacing) * -0.45);
    left: -0.5ch;
    z-index: 1;
    font-size: 0.8em;
    background: var(--sc-background);
    transform: translateY(-50%);
    opacity: 0;
  }

  .item:hover > .insert,
  .insert:focus-within {
    opacity: 1;
  }

  .empty {
    margin: 0;
    color: var(--sc-muted);
  }

  @media (prefers-reduced-motion: no-preference) {
    .insert {
      transition: opacity 100ms;
    }
  }
</style>
