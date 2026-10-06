<script lang="ts">
  // Step 6: your own control for one field. A snippet named for a field's
  // path draws that field alone ("." becomes "__": envelope.attack would be
  // envelope__attack). Here the wave becomes four buttons, each drawing its
  // shape; every other field stays as the theme draws it.
  import { Model, Schema, root, themes } from "../../../release";
  import { initial, type Wave } from "./data.ts";
  import { schema } from "./schema.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema);

  /** one cycle of each wave, as an SVG path in a 24×12 box */
  const shapes: Record<Wave, string> = {
    sine: "M0 6 C3 -2 9 -2 12 6 S21 14 24 6",
    triangle: "M0 6 L6 1 L18 11 L24 6",
    square: "M0 10 V2 H12 V10 H24 V2",
    sawtooth: "M0 10 L12 2 V10 L24 2 V10",
  };
</script>

{#await tree then node}
  <Schema root={node} {model} theme={themes.minimal}>
    {#snippet wave({ node, model })}
      <fieldset class="waves">
        <legend>{node.title}</legend>
        {#each node.options ?? [] as option}
          <label class:chosen={model.get(node) === option}>
            <input
              type="radio"
              name="wave"
              value={option}
              checked={model.get(node) === option}
              onchange={() => model.set(node, option)}
            />
            <svg viewBox="-1 -1 26 14" aria-hidden="true">
              <path d={shapes[option as Wave]} />
            </svg>
            {option}
          </label>
        {/each}
      </fieldset>
    {/snippet}
  </Schema>
{/await}

<style>
  .waves {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.93em;
  }

  label {
    display: grid;
    justify-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8em;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    cursor: pointer;
  }

  label.chosen {
    color: #7c3aed;
    border-color: #7c3aed;
    background: #f5f3ff;
  }

  label:focus-within {
    outline: 2px solid #7c3aed;
    outline-offset: 2px;
  }

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  svg {
    width: 48px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
  }
</style>
