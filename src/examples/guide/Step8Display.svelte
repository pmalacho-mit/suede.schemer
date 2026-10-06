<script lang="ts">
  // Step 8: your own display. model.data is the form's data, live (Svelte
  // state): read it anywhere, and whatever you draw from it follows every
  // edit. Here, the envelope's shape, and a button that plays the patch.
  import { Model, Schema, root, themes } from "../../../release";
  import { initial } from "./data.ts";
  import { schema } from "./schema.ts";
  import { play } from "./sound.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema);

  /** the envelope as a line: up for the attack, down for the release */
  const shape = $derived.by(() => {
    const { attack, release } = model.data.envelope;
    const width = 240 / Math.max(attack + release, 0.01);
    const top = 60 - model.data.volume * 50;
    return `0,60 ${attack * width},${top} ${(attack + release) * width},60`;
  });
</script>

<div class="patch">
  <section class="display" aria-label="The patch">
    <h4>{model.data.name}</h4>
    <svg viewBox="-4 -4 248 68" role="img" aria-label="Envelope">
      <polyline points={shape} />
    </svg>
    <button type="button" onclick={() => play($state.snapshot(model.data))}>
      ▶ Play
    </button>
  </section>

  {#await tree then node}
    <Schema root={node} {model} theme={themes.minimal} />
  {/await}
</div>

<style>
  .patch {
    display: grid;
    gap: 1rem;
  }

  .display {
    display: grid;
    gap: 0.5rem;
    padding: 1rem;
    color: #e9d5ff;
    background: #1e1b2e;
    border-radius: 12px;
  }

  h4 {
    margin: 0;
    font-weight: 600;
  }

  svg {
    width: 100%;
    height: auto;
  }

  polyline {
    fill: rgb(167 139 250 / 0.25);
    stroke: #a78bfa;
    stroke-width: 2;
    stroke-linejoin: round;
  }

  button {
    justify-self: start;
    padding: 0.4rem 1rem;
    font: inherit;
    color: #1e1b2e;
    background: #a78bfa;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }
</style>
