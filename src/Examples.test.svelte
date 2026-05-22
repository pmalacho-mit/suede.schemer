<script lang="ts" module>
  import { URLParameterize } from "../.suede/svelte-url-parameterizer-suede";

  type Data = Record<string, unknown>;
  type RootNode = Awaited<ReturnType<typeof root>>;

  const modes = ["edit", "stream", "view"] as const;
  type Mode = (typeof modes)[number];

  const examples = import.meta.glob<Record<string, unknown>>(
    "/public/**/*.json",
    { import: "default" },
  );

  const options = Array.from(
    new Set(
      Object.keys(examples).map((path) => path.replace(/\/[^\/]+\.json$/, "")),
    ),
  ).map((path) => ({
    path,
    importer: () =>
      Promise.all([
        examples[path + "/data.json"](),
        examples[path + "/schema.json"](),
      ]).then(([data, schema]) => ({
        data: data as Record<string, unknown>,
        schema: schema as JSONSchema7,
      })),
  }));
  type Option = (typeof options)[number];

  class Pocket {
    data: Data;
    model: Model;
    root: RootNode;

    private constructor(data: Data, model: Model, root: RootNode) {
      this.data = data;
      this.model = model;
      this.root = root;
    }

    static async Make(mode: Mode, option: Option) {
      const { data, schema } = await option.importer();
      const initial = mode === "stream" ? {} : data;
      return new Pocket(data, new Model(mode, initial), await root(schema));
    }
  }

  class Parameters {
    readonly urlTrack: URLParameterize.Return;

    rate = $state(300);
    size = $state(5);

    constructor() {
      this.urlTrack = URLParameterize<Parameters>(this, {
        rate: Number,
        size: Number,
      });
    }
  }
</script>

<script lang="ts">
  import type { JSONSchema7 } from "json-schema";
  import { Model, root, Schema } from "../release";
  import { flushSync } from "svelte";
  import { streamSteps } from "./utils";
  import Sweater from "../.suede/sweater-vest-suede/Sweater.svelte";

  const options = Array.from(
    new Set(
      Object.keys(examples).map((path) => path.replace(/\/[^\/]+\.json$/, "")),
    ),
  ).map((path) => ({
    path,
    importer: () =>
      Promise.all([
        examples[path + "/data.json"](),
        examples[path + "/schema.json"](),
      ]).then(([data, schema]) => ({
        data: data as Record<string, unknown>,
        schema: schema as JSONSchema7,
      })),
  }));

  const parameters = new Parameters();
</script>

<div
  style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;"
>
  <label>
    stream rate (ms / step):
    <input
      type="number"
      bind:value={parameters.rate}
      min={50}
      max={5000}
      step={50}
      style="width: 80px;"
    />
  </label>
  <label>
    string chunk size (chars / step):
    <input
      type="number"
      bind:value={parameters.size}
      min={1}
      max={20}
      step={1}
      style="width: 80px;"
    />
  </label>
</div>

{#each modes as mode}
  <Sweater config category={mode}>
    {#each options as option}
      {@const name = option.path.split("/").at(-1)}
      <Sweater
        lazy
        {name}
        body={async ({ set }) => {
          const pocket = set(await Pocket.Make(mode, option));

          if (mode === "stream") {
            const items = [...streamSteps(pocket.data, parameters.size)];
            let i = 0;
            let intervalId = setInterval(() => {
              if (i >= items.length) return clearInterval(intervalId);
              const { path, value } = items[i++];
              flushSync(() => pocket.model.set({ path }, value));
            }, parameters.rate);
          }
        }}
      >
        {#snippet vest(pocket: Pocket)}
          <Schema {...pocket} />
        {/snippet}
      </Sweater>
    {/each}
  </Sweater>
{/each}
