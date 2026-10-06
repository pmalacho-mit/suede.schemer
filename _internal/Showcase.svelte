<script lang="ts">
  import type Self from "./Showcase.svelte";
  import type { Test } from "../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { all } from "../components/themes/index.js";
  import type { editsEveryKind } from "./showcase.ts";
  import type { Mode } from "../models.svelte.js";
  import type { Theme } from "../components/registry.js";
  import { SchemaModel } from "../models.svelte.js";
  import { root } from "../nodes.js";
  import Schema from "../components/Root.svelte";
  import { schema, data } from "./showcase.js";

  /** The showcase form (every kind of field) drawn in `theme`. */
  let {
    theme,
    mode = "edit",
    model = new SchemaModel(mode, structuredClone(data)),
  }: { theme?: Theme; mode?: Mode; model?: SchemaModel } = $props();

  const tree = root(schema);
</script>

{#await tree then node}
  <Schema root={node} {model} {theme} />
{/await}

<!-- minimal: the showcase in edit mode, and read-only -->
{#snippet minimal(Showcase: typeof Self, themes: typeof all)}
  <div style="display: grid; gap: 2rem;">
    <Showcase theme={themes.minimal} />
    <Showcase theme={themes.minimal} mode="view" />
  </div>
{/snippet}

{#snippet minimalEditsEveryKind(
  Showcase: typeof Self,
  themes: typeof all,
  Model: typeof SchemaModel,
  seed: typeof data,
  check: typeof editsEveryKind,
  test: Test,
)}
  {@const model = new Model("edit", structuredClone(seed))}
  <Showcase theme={themes.minimal} {model} />
  {test((payload) => check(payload, model, "minimal"))}
{/snippet}

<!-- material: the showcase in edit mode, and read-only -->
{#snippet material(Showcase: typeof Self, themes: typeof all)}
  <div style="display: grid; gap: 2rem;">
    <Showcase theme={themes.material} />
    <Showcase theme={themes.material} mode="view" />
  </div>
{/snippet}

{#snippet materialEditsEveryKind(
  Showcase: typeof Self,
  themes: typeof all,
  Model: typeof SchemaModel,
  seed: typeof data,
  check: typeof editsEveryKind,
  test: Test,
)}
  {@const model = new Model("edit", structuredClone(seed))}
  <Showcase theme={themes.material} {model} />
  {test((payload) => check(payload, model, "material"))}
{/snippet}

<!-- paper: the showcase in edit mode, and read-only -->
{#snippet paper(Showcase: typeof Self, themes: typeof all)}
  <div style="display: grid; gap: 2rem;">
    <Showcase theme={themes.paper} />
    <Showcase theme={themes.paper} mode="view" />
  </div>
{/snippet}

{#snippet paperEditsEveryKind(
  Showcase: typeof Self,
  themes: typeof all,
  Model: typeof SchemaModel,
  seed: typeof data,
  check: typeof editsEveryKind,
  test: Test,
)}
  {@const model = new Model("edit", structuredClone(seed))}
  <Showcase theme={themes.paper} {model} />
  {test((payload) => check(payload, model, "paper"))}
{/snippet}

<!-- terminal: the showcase in edit mode, and read-only -->
{#snippet terminal(Showcase: typeof Self, themes: typeof all)}
  <div style="display: grid; gap: 2rem;">
    <Showcase theme={themes.terminal} />
    <Showcase theme={themes.terminal} mode="view" />
  </div>
{/snippet}

{#snippet terminalEditsEveryKind(
  Showcase: typeof Self,
  themes: typeof all,
  Model: typeof SchemaModel,
  seed: typeof data,
  check: typeof editsEveryKind,
  test: Test,
)}
  {@const model = new Model("edit", structuredClone(seed))}
  <Showcase theme={themes.terminal} {model} />
  {test((payload) => check(payload, model, "terminal"))}
{/snippet}

<!-- brutalist: the showcase in edit mode, and read-only -->
{#snippet brutalist(Showcase: typeof Self, themes: typeof all)}
  <div style="display: grid; gap: 2rem;">
    <Showcase theme={themes.brutalist} />
    <Showcase theme={themes.brutalist} mode="view" />
  </div>
{/snippet}

{#snippet brutalistEditsEveryKind(
  Showcase: typeof Self,
  themes: typeof all,
  Model: typeof SchemaModel,
  seed: typeof data,
  check: typeof editsEveryKind,
  test: Test,
)}
  {@const model = new Model("edit", structuredClone(seed))}
  <Showcase theme={themes.brutalist} {model} />
  {test((payload) => check(payload, model, "brutalist"))}
{/snippet}
