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

    readonly tracking = URLParameterize<Parameters>(this, {
      rate: Number,
      size: Number,
    });
  }
</script>

<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import type Self from "./Examples.svelte";
  // examples need no Test, but the DSL import is what marks this file as having them
  import type {} from "../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { flushSync, onDestroy } from "svelte";
  import { Model, root, Schema } from "../release";
  import type { Mode } from "../release/models.svelte";
  import { streamSteps } from "./utils";

  /** Every example under public/, rendered in `mode`; "stream" streams each one's data in. */
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

{#if mode === "stream"}
  <div
    style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;"
  >
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
  </div>
{/if}

{#each examples as example (example)}
  <section>
    <h3>{example}</h3>
    {#await load(example) then { model, node }}
      <Schema root={node} {model} />
    {/await}
  </section>
{/each}

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
