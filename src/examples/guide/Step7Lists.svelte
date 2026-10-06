<script lang="ts">
  // Step 7: lists and choices. Three more names a snippet can have:
  //
  // - harmonics___item: every item of a list ("*", any item, becomes "_item"),
  //   handed its index; harmonics___item__level would be that field of each.
  // - push__harmonics: the list's "add" button (splice__ and insert__ name its
  //   "remove" and "insert"). controls.actions does what each button does;
  //   the new item starts from the schema's defaults.
  // - filter: a oneOf, the choice between kinds of filter. controls.variants
  //   reads and sets the choice; renderChild draws the chosen one's fields.
  import { Model, Schema, controls, root, themes } from "../../../release";
  import { initial } from "./data.ts";
  import { schema } from "./schema.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema);
</script>

{#await tree then node}
  <Schema root={node} {model} theme={themes.minimal}>
    {#snippet harmonics___item({ node, index, renderChild })}
      <div class="harmonic">
        <span class="tag">Harmonic {(index ?? 0) + 1}</span>
        {#each node.children as child (child.path)}
          {@render renderChild(child, "object")}
        {/each}
      </div>
    {/snippet}

    {#snippet push__harmonics({ node, model })}
      <button
        type="button"
        class="add"
        onclick={() => controls.actions.push(node, model)}
      >
        + Add a harmonic
      </button>
    {/snippet}

    {#snippet filter({ node, model, renderChild })}
      {@const chosen = controls.variants.selected(node, model)}
      <div class="filter">
        <span>{node.title}</span>
        <div class="choices" role="radiogroup" aria-label={node.title}>
          {#each node.variants as variant, i}
            <button
              type="button"
              role="radio"
              aria-checked={i === chosen}
              onclick={() => controls.variants.select(node, model, i)}
            >
              {controls.variants.label(variant, i)}
            </button>
          {/each}
        </div>
        {#if chosen >= 0}
          {@render renderChild(node.variants[chosen], "oneOf")}
        {/if}
      </div>
    {/snippet}
  </Schema>
{/await}

<style>
  .harmonic {
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    align-items: end;
    gap: 0.75rem;
  }

  .tag {
    padding-bottom: 0.6em;
    font-size: 0.85em;
    font-weight: 600;
    color: #7c3aed;
  }

  @media (max-width: 480px) {
    .harmonic {
      grid-template-columns: 1fr;
    }
  }

  .add {
    align-self: flex-start;
    padding: 0.4rem 0.8rem;
    font: inherit;
    font-size: 0.9em;
    color: #7c3aed;
    background: none;
    border: 1px dashed #7c3aed;
    border-radius: 8px;
    cursor: pointer;
  }

  .filter {
    display: grid;
    gap: 0.5rem;
  }

  .filter > span {
    font-weight: 500;
    font-size: 0.93em;
  }

  .choices {
    display: inline-flex;
    justify-self: start;
    padding: 3px;
    background: #f4f4f5;
    border-radius: 9px;
  }

  .choices button {
    padding: 0.3rem 0.8rem;
    font: inherit;
    font-size: 0.9em;
    background: none;
    border: 0;
    border-radius: 7px;
    cursor: pointer;
  }

  .choices button[aria-checked="true"] {
    background: white;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
  }
</style>
