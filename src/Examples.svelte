<script lang="ts" module>
  import { URLParameterize } from "../suede.slurp";

  const fixtures = import.meta.glob<Record<string, unknown>>(
    "/public/*/{data,schema}.json",
    { import: "default" },
  );

  /** The example folders under public/, each with a data.json and a schema.json */
  const examples = [
    ...new Set(Object.keys(fixtures).map((path) => path.split("/")[2])),
  ];

  class Parameters {
    rate = $state(300);
    size = $state(5);
    /** a theme's name, or "" for the defaults */
    theme = $state("");
    /** a CSS colour for --schemer-accent, or "" for the theme's own */
    accent = $state("");

    readonly tracking = URLParameterize<Parameters>(this, {
      rate: Number,
      size: Number,
      theme: (query) => (typeof query === "string" ? query : ""),
      accent: (query) => (typeof query === "string" ? query : ""),
    });
  }
</script>

<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import type Self from "./Examples.svelte";
  // examples need no Test, but the DSL import is what marks this file as having them
  import type {} from "../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { flushSync, onDestroy } from "svelte";
  import { Model, root, Schema, themes } from "../release";
  import type { Mode } from "../release/models.svelte";
  import { streamSteps } from "./utils";

  /** Every example under public/, rendered in `mode` and the chosen theme; "stream" streams each one's data in. */
  let { mode }: { mode: Mode } = $props();

  const parameters = new Parameters();
  const intervals: ReturnType<typeof setInterval>[] = [];
  let destroyed = false;

  onDestroy(() => {
    destroyed = true;
    intervals.forEach(clearInterval);
    parameters.tracking.cleanup();
  });

  const streamInto = (model: Model, data: Record<string, unknown>) => {
    const steps = [...streamSteps(data, parameters.size)];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) return clearInterval(interval);
      const { path, value } = steps[i++];
      flushSync(() => model.set({ path }, value));
    }, parameters.rate);
    intervals.push(interval);
  };

  const load = async (example: string) => {
    const [data, schema] = await Promise.all([
      fixtures[`/public/${example}/data.json`](),
      fixtures[`/public/${example}/schema.json`](),
    ]);
    const model = new Model(mode, mode === "stream" ? {} : data);
    const node = await root(schema as JSONSchema7);
    if (mode === "stream" && !destroyed) streamInto(model, data);
    return { model, node };
  };
</script>

<div
  style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;"
>
  <label>
    theme
    <select bind:value={parameters.theme}>
      <option value="">defaults</option>
      {#each Object.keys(themes.all) as name}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </label>
  {#if parameters.theme}
    <label>
      accent
      <input
        type="color"
        value={parameters.accent || "#000000"}
        oninput={({ currentTarget }) =>
          (parameters.accent = currentTarget.value)}
      />
    </label>
    {#if parameters.accent}
      <button onclick={() => (parameters.accent = "")}>theme's accent</button>
    {/if}
  {/if}
  {#if mode === "stream"}
    {@render parameter("rate", "stream rate (ms / step)", {
      min: 50,
      max: 5000,
      step: 50,
    })}
    {@render parameter("size", "stream chunk size (chars / step)", {
      min: 1,
      max: 20,
      step: 1,
    })}
  {/if}
</div>

<!-- the accent is set on an ancestor: every theme reads --schemer-* from wherever it is set -->
<div style:--schemer-accent={parameters.accent || undefined}>
  {#each examples as example (example)}
    <section>
      <h3>{example}</h3>
      {#await load(example) then { model, node }}
        <Schema
          root={node}
          {model}
          theme={themes.all[parameters.theme as keyof typeof themes.all]}
        />
      {/await}
    </section>
  {/each}
</div>

{#snippet parameter(
  key: "rate" | "size",
  title: string,
  config: Record<"min" | "max" | "step", number>,
)}
  <label>
    {title}
    <input
      type="number"
      style="width: 80px;"
      bind:value={parameters[key]}
      {...config}
    />
  </label>
{/snippet}

<!-- examples only: a page each on the dev server, and a test that it mounts -->
{#snippet edit(Examples: typeof Self)}
  <Examples mode="edit" />
{/snippet}

{#snippet stream(Examples: typeof Self)}
  <Examples mode="stream" />
{/snippet}

{#snippet view(Examples: typeof Self)}
  <Examples mode="view" />
{/snippet}
