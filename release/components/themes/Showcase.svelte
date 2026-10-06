<script lang="ts">
  import type Self from "./Showcase.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { all } from "./index.js";
  import type { editsEveryKind } from "./harness.ts";
  import type { Mode } from "../../models.svelte.js";
  import type { Theme } from "../registry.js";
  import { SchemaModel } from "../../models.svelte.js";
  import { root } from "../../nodes.js";
  import Schema from "../Root.svelte";
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
  <Showcase theme={themes.minimal} />
  <Showcase theme={themes.minimal} mode="view" />
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
