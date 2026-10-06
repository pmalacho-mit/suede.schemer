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
    <p class="empty">No entries.</p>
  {/if}

  <ol class="items">
    {#each items as _, index (index)}
      <li class="item" class:editable={model.editable}>
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
        <span class="numeral" aria-hidden="true">{index + 1}.</span>
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
    --gap: calc(var(--sc-spacing) * 0.9);
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* entries that are groups of fields want more air between them */
  .items:has(> .item > .content > :global(div > fieldset)) {
    --gap: calc(var(--sc-spacing) * 1.6);
  }

  .items:empty {
    display: none;
  }

  /* numbered like the entries of a printed list: the number hangs in the margin */
  .item {
    position: relative;
    display: grid;
    grid-template-columns: 2.1em minmax(0, 1fr);
    align-items: baseline;
    column-gap: calc(var(--sc-spacing) * 0.5);
  }

  .editable {
    grid-template-columns: 2.1em minmax(0, 1fr) auto;
  }

  .numeral {
    font-style: italic;
    font-variant-numeric: oldstyle-nums;
    color: var(--sc-accent);
    text-align: right;
    padding-right: 0.2em;
  }

  .content {
    min-width: 0;
  }

  .splice {
    font-size: 0.85em;
  }

  /* insert sits on the seam above its item, under the numbers, shown on hover or focus */
  .insert {
    position: absolute;
    top: calc(var(--gap) / -2);
    left: 0;
    z-index: 1;
    transform: translateY(-50%);
    opacity: 0;
  }

  .item:hover > .insert,
  .insert:focus-within {
    opacity: 1;
  }

  @media (prefers-reduced-motion: no-preference) {
    .insert {
      transition: opacity 140ms ease;
    }
  }

  .empty {
    margin: 0;
    font-style: italic;
    color: var(--sc-muted);
  }
</style>
