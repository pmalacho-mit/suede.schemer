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
          <ArrayAction action="splice" renderer={spliceRenderer} {node} {model} {index} />
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
    align-items: flex-end;
    gap: calc(var(--sc-spacing) / 2);
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  /* insert sits on the seam above its item, shown on hover or focus */
  .insert {
    position: absolute;
    top: calc(var(--sc-spacing) * -0.75);
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 120ms;
  }

  .item:hover > .insert,
  .insert:focus-within {
    opacity: 1;
  }

  .empty {
    margin: 0;
    color: var(--sc-muted);
    font-size: 0.9em;
  }
</style>
