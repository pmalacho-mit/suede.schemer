<script lang="ts">
  // Step 5: your own control for every field of a kind. A snippet declared
  // inside <Schema> and named for a kind (string, number, boolean, object,
  // array, tuple, oneOf, enum) draws every field of that kind. It is handed
  // the field's node (its schema, as the library reads it) and the model, so
  // the slider takes its bounds and step from the schema.
  import { Model, Schema, root, themes } from "../../../release";
  import { initial } from "./data.ts";
  import { schema } from "./schema.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema);
</script>

{#await tree then node}
  <Schema root={node} {model} theme={themes.minimal}>
    {#snippet number({ node, model })}
      <label class="slider">
        <span>{node.title}</span>
        <input
          type="range"
          min={node.min}
          max={node.max}
          step={node.step ?? "any"}
          value={model.get(node)}
          oninput={model.on(node, Number)}
        />
        <output>{model.get(node)}</output>
      </label>
    {/snippet}
  </Schema>
{/await}

<style>
  .slider {
    display: grid;
    grid-template-columns: 6rem 1fr 3.5rem;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.93em;
  }

  input {
    accent-color: #7c3aed;
  }

  output {
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
</style>
