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
    <p class="empty">No items yet.</p>
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
          <div class="trailing">
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
  /* a list: one row per item, its remove button trailing */
  .items {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing) * 0.75);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .items:empty {
    display: none;
  }

  .item {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: calc(var(--sc-spacing) * 0.25);
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  /* centred on a filled field's 3.5em; level with a card's title */
  .trailing {
    flex: none;
    margin-top: 0.5em;
    margin-right: -0.5em;
  }

  /* insert sits on the seam above its item, shown on hover or focus */
  .insert {
    position: absolute;
    top: calc(var(--sc-spacing) * -0.375);
    left: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  .item:hover > .insert,
  .insert:focus-within {
    opacity: 1;
  }

  .empty {
    margin: 0;
    padding: 0 var(--sc-md-inset);
    font-size: 0.875em;
    color: var(--sc-muted);
  }

  @media (prefers-reduced-motion: no-preference) {
    .insert {
      transition: opacity 150ms;
    }
  }
</style>
