<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    controls,
    defaults,
    Model,
    root,
    Schema,
    themes,
    type Theme,
  } from "../../../release";
  import type { Field } from "../../../release/components/Field.svelte";
  import Bracket from "./Bracket.svelte";
  import Dial from "./Dial.svelte";
  import Plane from "./Plane.svelte";
  import Segmented from "./Segmented.svelte";
  import {
    apply,
    compose,
    determinant,
    eigen,
    inverse,
    stepMatrix,
    tween,
    type Draft,
    type StepType,
  } from "./linear.ts";
  import { coordinates, format, orientation, product, symbol } from "./plot.ts";
  import {
    fresh,
    initial,
    schema,
    shapes,
    stepTypes,
    type MatrixData,
    type Shape,
  } from "./schema.ts";

  import type Self from "./Matrix.svelte";
  import type { Test } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import type { entries, explorer } from "./matrix.harness.ts";

  /**
   * A 2×2 linear-transformation explorer: a JSON Schema form of steps (each a
   * oneOf: rotation, scale, shear, reflection or a raw matrix) beside the
   * plane they transform, the composed matrix and what it says.
   */
  let {
    theme = themes.minimal,
    model = new Model("edit", initial()),
    t = $bindable(1),
  }: {
    theme?: Theme;
    model?: Model<"edit", MatrixData>;
    /** how far the plot is tweened from the identity (0) to the matrix (1) */
    t?: number;
  } = $props();

  const tree = root(schema);

  /** the theme's component for each kind, for renderers that wrap rather than replace */
  const kinds = $derived({ ...defaults.component.byKind, ...theme.byKind });

  const steps = $derived<Draft[]>(model.data.steps ?? []);
  const composed = $derived(compose(steps));
  const current = $derived(tween(steps, t));
  const det = $derived(determinant(composed));
  const sign = $derived(orientation(det));
  const inv = $derived(inverse(composed));
  const eig = $derived(eigen(composed));
  const shown = $derived(current.matrix);

  // ---- playing the tween --------------------------------------------------

  const PER_STEP = 1300;
  let playing = $state(false);
  let frame = 0;

  const reducedMotion = () =>
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stop = () => {
    playing = false;
    if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
  };

  const play = () => {
    if (playing) return stop();
    // without motion, show where the tween ends rather than how it gets there
    if (reducedMotion() || typeof requestAnimationFrame !== "function") {
      t = 1;
      return;
    }
    if (t >= 1) t = 0;
    playing = true;
    let last = performance.now();
    const tick = (now: number) => {
      const duration = PER_STEP * Math.max(1, steps.length);
      t = Math.min(1, t + (now - last) / duration);
      last = now;
      if (t < 1 && playing) frame = requestAnimationFrame(tick);
      else playing = false;
    };
    frame = requestAnimationFrame(tick);
  };

  onDestroy(stop);

  const status = $derived(
    steps.length === 0
      ? "No steps: the identity"
      : t <= 0
        ? "The identity: nothing has moved yet"
        : t >= 1
          ? `All ${steps.length} ${steps.length === 1 ? "step" : "steps"} applied`
          : `Step ${current.step + 1} of ${steps.length}: ${symbol(steps[current.step])}`,
  );

  // ---- editing the list of steps -----------------------------------------

  const move = (from: number, to: number) => {
    const list = $state.snapshot(model.data.steps);
    if (to < 0 || to >= list.length) return;
    const [step] = list.splice(from, 1);
    list.splice(to, 0, step);
    model.data.steps = list;
  };

  const remove = (index: number) => {
    const list = $state.snapshot(model.data.steps);
    list.splice(index, 1);
    model.data.steps = list;
  };


  const entryNames = [
    ["a", "b"],
    ["c", "d"],
  ];
</script>

<!-- ---- renderers: snippets passed to <Schema>, by kind and by path ---- -->

{#snippet stepIcon(type: StepType)}
  <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
    {#if type === "rotation"}
      <path d="M13.2 9.5A5.4 5.4 0 1 1 11.6 4" />
      <path d="M12.4 1.2v3.2H9.2" />
    {:else if type === "scale"}
      <rect x="2" y="8" width="6" height="6" />
      <path d="M2 2h12v12" stroke-dasharray="2 2" />
    {:else if type === "shear"}
      <path d="M2 13.5 6 2.5h8l-4 11z" />
    {:else if type === "reflection"}
      <path d="M8 1v14" stroke-dasharray="2 1.6" />
      <path d="M5.5 4 2 12h3.5zM10.5 4 14 12h-3.5z" />
    {:else}
      <path d="M4.5 2H2v12h2.5M11.5 2H14v12h-2.5" />
      <circle cx="6" cy="5.5" r=".6" /><circle cx="10" cy="5.5" r=".6" />
      <circle cx="6" cy="10.5" r=".6" /><circle cx="10" cy="10.5" r=".6" />
    {/if}
  </svg>
{/snippet}

{#snippet shapeIcon(shape: Shape)}
  <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
    {#if shape === "Unit square"}
      <rect x="3" y="3" width="10" height="10" />
    {:else if shape === "Grid"}
      <path d="M2 2h12v12H2zM6 2v12M10 2v12M2 6h12M2 10h12" />
    {:else if shape === "Letter F"}
      <path d="M4.5 14V2h8M4.5 7.5h6" />
    {:else}
      <circle cx="8" cy="8" r="5.6" />
    {/if}
  </svg>
{/snippet}

<!-- the display toggles: the theme's switch, keyed to the plot by a swatch -->
{#snippet toggle(props: Field.Props<"boolean">, key: string)}
  {@const Boolean_ = kinds.boolean}
  <div class="toggle">
    <span class="swatch {key}" aria-hidden="true"></span>
    <div class="switch"><Boolean_ {...props} /></div>
  </div>
{/snippet}

<!-- ---- the page ---- -->

<div class="explorer">
  <header class="masthead">
    <p class="eyebrow">suede.schemer · example</p>
    <h1>What a matrix does to the plane</h1>
    <p class="lede">
      Compose a transformation from steps on the left; every control there is
      drawn from a JSON Schema. The figure shows where the plane, its basis
      and a shape end up.
    </p>
  </header>

  <div class="layout">
    <section class="controls" aria-label="The transformation">
      {#await tree then node}
        <Schema
          root={node}
          {model}
          {theme}
          --schemer-radius="10px"
        >
          <!-- one step of the transformation: a card with its type, its matrix and its fields -->
          {#snippet steps___item({ node, model, index = 0, renderChild })}
            {@const value = model.get(node) as Draft}
            {@const selected = controls.variants.selected(node, model)}
            {@const variant = selected >= 0 ? node.variants[selected] : undefined}
            {@const type = selected >= 0 ? stepTypes[selected] : undefined}
            {@const count = steps.length}
            {@const done =
              index < current.step ? 1 : index === current.step ? current.progress : 0}
            <article
              class="step"
              class:moving={t < 1 && index === current.step}
              style:--done={done}
              data-step={index}
              aria-label="Step {index + 1}"
            >
              <header>
                <span class="badge" aria-hidden="true">{index + 1}</span>
                <span class="picker">
                  {#if type}{@render stepIcon(type)}{/if}
                  <select
                    aria-label="Step {index + 1} type"
                    value={type ?? ""}
                    disabled={!model.editable}
                    onchange={({ currentTarget }) =>
                      model.set(node, fresh(currentTarget.value as StepType))}
                  >
                    {#if !type}<option value="" disabled>Choose…</option>{/if}
                    {#each stepTypes as option, i}
                      <option value={option}>{node.variants[i]?.title ?? option}</option>
                    {/each}
                  </select>
                </span>
                <code class="symbol">{symbol(value)}</code>
                {#if model.editable}
                  <span class="tools">
                    <button
                      type="button"
                      class="tool"
                      aria-label="Move step {index + 1} up"
                      title="Move up (acts earlier)"
                      disabled={index === 0}
                      onclick={() => move(index, index - 1)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
                    </button>
                    <button
                      type="button"
                      class="tool"
                      aria-label="Move step {index + 1} down"
                      title="Move down (acts later)"
                      disabled={index === count - 1}
                      onclick={() => move(index, index + 1)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" /></svg>
                    </button>
                    <button
                      type="button"
                      class="tool danger"
                      aria-label="Remove step {index + 1}"
                      title="Remove"
                      onclick={() => remove(index)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                    </button>
                  </span>
                {/if}
              </header>

              {#if variant}
                <div class="body">
                  {#if variant.description}
                    <p class="about">{variant.description}</p>
                  {/if}
                  {#if variant.kind === "object"}
                    <div class="fields">
                      {#each variant.children.filter((c) => !controls.is.const(c)) as child (child.path)}
                        {@render renderChild(child, "object")}
                      {/each}
                    </div>
                  {/if}
                  {#if type !== "matrix"}
                    <div class="own">
                      <span>{symbol(value)} =</span>
                      <Bracket matrix={stepMatrix(value)} size="sm" label="Step {index + 1}'s matrix" />
                    </div>
                  {/if}
                </div>
              {/if}
              {#if t < 1}<span class="progress" aria-hidden="true"></span>{/if}
            </article>
          {/snippet}

          <!-- a step's matrix: a tuple of two tuples, set as a bracketed grid of inputs -->
          {#snippet steps___item__matrix(props)}
            <div class="matrix-field">
              <span class="field-name" id="{props.node.path}-name">{props.node.title}</span>
              <div class="matrix-input" role="group" aria-labelledby="{props.node.path}-name">
                {#each props.node.itemNodes as row}
                  {#if row.kind === "tuple"}
                    {#each row.itemNodes as entry, c (entry.path)}
                      {@render props.renderChild(entry, "tuple", c)}
                    {/each}
                  {/if}
                {/each}
              </div>
              <small class="hint">
                The first column is where <b class="i">î</b> lands; the second, <b class="j">ĵ</b>.
              </small>
            </div>
          {/snippet}

          <!-- a matrix entry: a cell of the grid, its column its index in the row, its row the one before -->
          {#snippet steps___item__matrix___item___item({ node, model, index: c = 0 })}
            {@const r = Number(node.path.split(".").at(-2))}
            <input
              class="cell"
              class:i={c === 0}
              class:j={c === 1}
              type="number"
              step="0.1"
              inputmode="decimal"
              aria-label="{entryNames[r][c]}: row {r + 1}, column {c + 1}"
              value={model.get(node)}
              disabled={!model.editable}
              oninput={model.on(node, Number)}
            />
          {/snippet}

          <!-- a rotation's angle: a dial beside the theme's number field, with common angles -->
          {#snippet steps___item__degrees(props)}
            {@const { node, model } = props}
            {@const Number_ = kinds.number}
            <div class="angle">
              <Dial
                value={model.get(node)}
                onchange={(degrees) => model.set(node, degrees)}
                label={node.title ?? "Angle"}
                min={node.min}
                max={node.max}
                disabled={!model.editable}
              />
              <div class="angle-fields">
                <Number_ {...props} />
                <div class="presets" role="group" aria-label="Common angles">
                  {#each [-90, 30, 45, 90, 180] as preset}
                    <button
                      type="button"
                      class:on={model.get(node) === preset}
                      aria-pressed={model.get(node) === preset}
                      disabled={!model.editable}
                      onclick={() => model.set(node, preset)}>{format(preset)}°</button
                    >
                  {/each}
                </div>
              </div>
            </div>
          {/snippet}

          <!-- other numbers: a bounded factor as a slider, the rest as the theme draws them -->
          {#snippet number(props)}
            {@const { node, model } = props}
            {@const Number_ = kinds.number}
            {#if node.min !== undefined && node.max !== undefined}
              {@const id = `${node.path}-range`}
              {@const value = model.get(node)}
              <div class="ranged">
                <label class="field-name" for={id}>{node.title ?? node.path}</label>
                <div class="ranged-row">
                  <input
                    {id}
                    type="range"
                    min={node.min}
                    max={node.max}
                    step="0.05"
                    value={value ?? 0}
                    disabled={!model.editable}
                    oninput={model.on(node, Number)}
                    style:--fill="{(((value ?? 0) - node.min) / (node.max - node.min)) * 100}%"
                  />
                  <input
                    class="ranged-value"
                    type="number"
                    step="0.1"
                    min={node.min}
                    max={node.max}
                    aria-label="{node.title ?? node.path}, exactly"
                    {value}
                    disabled={!model.editable}
                    oninput={model.on(node, Number)}
                  />
                </div>
                {#if node.description}<small class="hint">{node.description}</small>{/if}
              </div>
            {:else}
              <Number_ {...props} />
            {/if}
          {/snippet}

          <!-- a short list of strings: segments instead of a select -->
          {#snippet string(props)}
            {@const { node, model } = props}
            {#if node.options && node.options.length <= 4}
              <Segmented
                name={node.path}
                legend={node.title ?? node.path}
                description={node.description}
                options={node.options}
                value={model.get(node)}
                onchange={(value) => model.set(node, value)}
                disabled={!model.editable}
              />
            {:else}
              {@const String_ = kinds.string}
              <String_ {...props} />
            {/if}
          {/snippet}

          <!-- the shape: the same segments, each with a picture -->
          {#snippet shape({ node, model })}
            <Segmented
              name="shape"
              legend={node.title ?? "Shape"}
              description={node.description}
              options={shapes}
              value={model.get(node) as Shape | undefined}
              onchange={(value) => model.set(node, value)}
              icon={shapeIcon}
              disabled={!model.editable}
            />
          {/snippet}

          {#snippet display__basis(props)}
            {@render toggle(props, "basis")}
          {/snippet}

          {#snippet display__determinant(props)}
            {@render toggle(props, "determinant")}
          {/snippet}

          {#snippet display__eigenvectors(props)}
            {@render toggle(props, "eigenvectors")}
          {/snippet}

          <!-- adding a step: one button per type, each adding a step that already does something -->
          {#snippet push__steps({ node, model })}
            <div class="add" role="group" aria-label="Add a step">
              <span class="add-label">Add a step</span>
              <div class="add-buttons">
                {#each stepTypes as type, i}
                  <button
                    type="button"
                    data-add={type}
                    onclick={() => model.get(node)?.push(fresh(type))}
                  >
                    {@render stepIcon(type)}
                    {node.itemNode.kind === "oneOf" ? node.itemNode.variants[i].title : type}
                  </button>
                {/each}
              </div>
            </div>
          {/snippet}

          <!-- each card carries its own move and remove buttons -->
          {#snippet splice__steps(_)}{/snippet}

          {#snippet insert__steps(_)}{/snippet}
        </Schema>
      {/await}
    </section>

    <section class="figure" aria-label="The plane">
      <figure>
        <div class="canvas">
          <Plane
            matrix={shown}
            final={composed}
            shape={model.data.shape ?? "Letter F"}
            display={model.data.display ?? { basis: true, determinant: true, eigenvectors: true }}
          />
        </div>
        <figcaption class="legend">
          {#if model.data.display?.basis}
            <span data-legend="i"><i class="key i"></i>Mî = {coordinates(apply(shown, [1, 0]))}</span>
            <span data-legend="j"><i class="key j"></i>Mĵ = {coordinates(apply(shown, [0, 1]))}</span>
          {/if}
          {#if model.data.display?.determinant}
            <span><i class="key area" class:negative={determinant(shown) < 0}></i>unit square's image</span>
          {/if}
          {#if model.data.display?.eigenvectors}
            <span><i class="key eigen"></i>eigenvector lines</span>
          {/if}
          <span><i class="key shape"></i>{model.data.shape ?? "shape"}, before and after</span>
        </figcaption>
      </figure>

      <div class="player">
        <button
          type="button"
          class="play"
          aria-label={playing ? "Pause" : t >= 1 ? "Replay the transformation" : "Play the transformation"}
          onclick={play}
        >
          {#if playing}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" /></svg>
          {:else}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path class="fill" d="M5 3l8 5-8 5z" /></svg>
          {/if}
        </button>
        <label class="scrub">
          <span class="t">t</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            aria-label="Tween from the identity (0) to the matrix (1)"
            aria-valuetext="{format(t)}: {status}"
            bind:value={t}
            oninput={stop}
            style:--fill="{t * 100}%"
          />
          <output>{t.toFixed(2)}</output>
        </label>
        <p class="status">{status}</p>
      </div>

      <div class="readout" data-readout="summary">
        <div class="equation">
          <span class="lhs"><var>M</var> =</span>
          <span class="product" data-readout="product">{product(steps)}</span>
          <span class="eq">=</span>
          <span data-readout="matrix">
            <Bracket matrix={composed} size="lg" columns label="The composed matrix M" />
          </span>
        </div>
        {#if steps.length > 1}
          <p class="note">
            Read right to left: {symbol(steps[0])} acts first, {symbol(steps[steps.length - 1])} last.
          </p>
        {/if}

        <dl class="facts">
          <div class="fact">
            <dt>Determinant</dt>
            <dd>
              <strong class="det" data-readout="determinant" data-sign={sign.sign}>{format(det)}</strong>
              <span class="sub">
                {#if sign.sign === 0}
                  The plane is flattened onto a line: areas become 0.
                {:else}
                  Areas scale by {format(Math.abs(det))};
                  <span data-readout="orientation">{sign.label}</span>.
                {/if}
              </span>
            </dd>
          </div>
          <div class="fact">
            <dt>Inverse</dt>
            <dd data-readout="inverse">
              {#if inv}
                <Bracket matrix={inv} size="sm" label="The inverse of M" />
              {:else}
                <span class="sub">None: a flattened plane can't be unflattened.</span>
              {/if}
            </dd>
          </div>
          <div class="fact">
            <dt>Eigenvalues</dt>
            <dd data-readout="eigen">
              {#if eig.kind === "complex"}
                <span class="mono">{format(eig.re)} ± {format(eig.im)}i</span>
                <span class="sub">Complex: every direction turns, so no real eigenvectors.</span>
              {:else if eig.everyDirection}
                <span class="mono">λ = {format(eig.values[0])}</span>
                <span class="sub">Every direction is an eigenvector.</span>
              {:else if eig.vectors.length === 1}
                <span class="mono">λ = {format(eig.values[0])} (twice)</span>
                <span class="sub">One line stays put: along {coordinates(eig.vectors[0])}.</span>
              {:else}
                <span class="mono">λ₁ = {format(eig.values[0])}, λ₂ = {format(eig.values[1])}</span>
                <span class="sub">Along {coordinates(eig.vectors[0])} and {coordinates(eig.vectors[1])}.</span>
              {/if}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</div>

<style>
  .explorer {
    --paper: #fbfaf8;
    --card: #ffffff;
    --ink: #1c1917;
    --muted: #6f6a64;
    --line: #e7e4df;
    --i-hat: #eb6834;
    --j-hat: #2a78d6;
    --det-pos: #1baf7a;
    --det-neg: #e34948;
    --eigen: #4a3aa7;
    --grid-faint: #ece9e4;
    --grid-axis: #a8a29e;
    --grid-bent: #334155;
    --math: "STIX Two Math", "Cambria Math", "Latin Modern Math", Georgia, serif;

    box-sizing: border-box;
    min-height: 100%;
    padding: clamp(16px, 3.5vw, 44px);
    color: var(--ink);
    background: var(--paper);
    font-family:
      ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif;
    font-size: 15px;
    line-height: 1.5;
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    .explorer {
      --paper: #151514;
      --card: #1c1c1b;
      --ink: #f4f3f1;
      --muted: #a8a29e;
      --line: #2f2e2c;
      --i-hat: #d95926;
      --j-hat: #3987e5;
      --det-pos: #199e70;
      --det-neg: #e66767;
      --eigen: #9085e9;
      --grid-faint: #262524;
      --grid-axis: #57534e;
      --grid-bent: #b8b4ae;
      color-scheme: dark;
    }
  }

  .explorer *,
  .explorer *::before,
  .explorer *::after {
    box-sizing: border-box;
  }

  /* ---- masthead ---- */

  .masthead {
    max-width: 1240px;
    margin: 0 auto clamp(20px, 3vw, 36px);
  }

  .eyebrow {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  h1 {
    margin: 0;
    font-family: var(--math);
    font-weight: 500;
    font-size: clamp(26px, 4vw, 40px);
    line-height: 1.1;
    letter-spacing: -0.01em;
  }

  .lede {
    max-width: 62ch;
    margin: 10px 0 0;
    color: var(--muted);
  }

  /* ---- layout: form | figure, stacked (figure first) on a phone ---- */

  .layout {
    display: grid;
    grid-template-columns: minmax(330px, 410px) minmax(0, 1fr);
    gap: clamp(20px, 3vw, 40px);
    align-items: start;
    max-width: 1240px;
    margin: 0 auto;
  }

  .controls {
    min-width: 0;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--card);
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.03);
    overflow: hidden;
  }

  /* the form's own surfaces follow the page (light and dark alike) */
  .controls :global([data-theme="minimal"]) {
    --schemer-background: var(--card);
    --schemer-surface: var(--card);
    --schemer-border: var(--line);
    --schemer-text: var(--ink);
    --schemer-muted: var(--muted);
  }

  .figure {
    position: sticky;
    top: 16px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  @media (max-width: 880px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
    }

    .figure {
      position: static;
      order: -1;
    }
  }

  figure {
    margin: 0;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--card);
    overflow: hidden;
  }

  .canvas {
    max-width: 640px;
    margin: 0 auto;
    padding: 8px;
  }

  /* ---- legend ---- */

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    padding: 10px 16px 12px;
    border-top: 1px solid var(--line);
    font-size: 13px;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .key {
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: 2px;
    background: var(--ink);
  }

  .key.i {
    background: var(--i-hat);
  }

  .key.j {
    background: var(--j-hat);
  }

  .key.area {
    height: 10px;
    border: 1.5px solid var(--det-pos);
    background: color-mix(in srgb, var(--det-pos) 22%, transparent);
  }

  .key.area.negative {
    border-color: var(--det-neg);
    background: color-mix(in srgb, var(--det-neg) 22%, transparent);
  }

  .key.eigen {
    background: repeating-linear-gradient(90deg, var(--eigen) 0 5px, transparent 5px 8px);
  }

  .key.shape {
    height: 10px;
    border: 1.5px solid var(--ink);
    background: color-mix(in srgb, var(--ink) 10%, transparent);
  }

  /* ---- player ---- */

  .player {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 4px 14px;
  }

  .play {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 50%;
    color: var(--card);
    background: var(--ink);
    cursor: pointer;
    transition: transform 120ms;
  }

  .play:hover {
    transform: scale(1.05);
  }

  .play:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 3px;
  }

  .play svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
  }

  .play svg .fill {
    fill: currentColor;
    stroke-linejoin: round;
  }

  .scrub {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .t {
    font-family: var(--math);
    font-style: italic;
    font-size: 18px;
  }

  .scrub output {
    min-width: 2.6em;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }

  .scrub input {
    flex: 1;
    min-width: 0;
    height: 24px;
    margin: 0;
    background: transparent;
    appearance: none;
    cursor: pointer;
  }

  .scrub input::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--ink) var(--fill), var(--line) var(--fill));
  }

  .scrub input::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--ink) var(--fill), var(--line) var(--fill));
  }

  .scrub input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -7px;
    border-radius: 50%;
    background: var(--card);
    border: 2px solid var(--ink);
  }

  .scrub input::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--card);
    border: 2px solid var(--ink);
  }

  .scrub input:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .status {
    grid-column: 2;
    margin: 0;
    font-size: 13px;
    color: var(--muted);
  }

  /* ---- readouts ---- */

  .readout {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 20px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--card);
  }

  .equation {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    font-family: var(--math);
    font-size: 18px;
  }

  .equation var {
    font-style: italic;
    font-size: 22px;
  }

  .product {
    font-size: 17px;
    color: var(--muted);
  }

  .note {
    margin: -4px 0 0;
    font-size: 13px;
    color: var(--muted);
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px 20px;
    margin: 0;
    padding-top: 12px;
    border-top: 1px solid var(--line);
  }

  .fact {
    min-width: 0;
  }

  dt {
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--muted);
  }

  dd {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
  }

  .det {
    font-family: var(--math);
    font-size: 26px;
    font-weight: 500;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .det[data-sign="1"] {
    box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--det-pos) 60%, transparent);
  }

  .det[data-sign="-1"] {
    box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--det-neg) 70%, transparent);
  }

  .mono {
    font-family: var(--math);
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }

  .sub {
    font-size: 13px;
    color: var(--muted);
  }

  /* ---- the form's custom renderers ---- */

  .icon {
    width: 16px;
    height: 16px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .icon circle[r=".6"] {
    fill: currentColor;
  }

  /* a step */
  .step {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--sc-border, var(--line));
    border-radius: 12px;
    background: var(--sc-background, var(--card));
    overflow: hidden;
    transition:
      border-color 150ms,
      box-shadow 150ms;
  }

  .step.moving {
    border-color: color-mix(in srgb, var(--ink) 50%, var(--line));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .step header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 10px;
    border-bottom: 1px solid var(--sc-border, var(--line));
    background: color-mix(in srgb, var(--sc-border, var(--line)) 22%, transparent);
  }

  .badge {
    display: grid;
    place-items: center;
    flex: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    color: var(--card);
    background: var(--ink);
  }

  .picker {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 0;
  }

  .picker .icon {
    position: absolute;
    left: 9px;
    pointer-events: none;
    color: var(--muted);
  }

  .picker select {
    height: 30px;
    padding: 0 26px 0 31px;
    font: inherit;
    font-weight: 600;
    color: var(--sc-text, var(--ink));
    background: var(--sc-surface, var(--card))
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 6.5 8 10l3.5-3.5' fill='none' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")
      no-repeat right 7px center / 14px;
    border: 1px solid var(--sc-border, var(--line));
    border-radius: 8px;
    appearance: none;
    cursor: pointer;
  }

  .picker select:focus-visible,
  .tool:focus-visible,
  .add button:focus-visible,
  .presets button:focus-visible {
    outline: 2px solid var(--sc-accent, var(--ink));
    outline-offset: 1px;
  }

  .symbol {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--math);
    font-size: 15px;
    color: var(--muted);
  }

  .tools {
    display: inline-flex;
    flex: none;
  }

  .tool {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    color: var(--muted);
    background: transparent;
    cursor: pointer;
  }

  .tool svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .tool:hover:not(:disabled) {
    color: var(--ink);
    background: color-mix(in srgb, var(--line) 70%, transparent);
  }

  .tool.danger:hover {
    color: var(--det-neg);
    background: color-mix(in srgb, var(--det-neg) 10%, transparent);
  }

  .tool:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .step .body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 14px 14px;
  }

  .about {
    margin: 0;
    font-size: 13px;
    color: var(--muted);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .own {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    font-family: var(--math);
    font-size: 14px;
    color: var(--muted);
  }

  /* how far the tween has carried this step */
  .progress {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: calc(var(--done) * 100%);
    background: var(--ink);
    opacity: 0.7;
  }

  /* an angle: the dial beside the theme's number field and some presets */
  .angle {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .angle-fields {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .presets button {
    min-width: 2.8em;
    height: 26px;
    padding: 0 7px;
    font: inherit;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--muted);
    background: transparent;
    border: 1px solid var(--sc-border, var(--line));
    border-radius: 999px;
    cursor: pointer;
  }

  .presets button:hover,
  .presets button.on {
    color: var(--ink);
    border-color: var(--ink);
  }

  /* a bounded factor: a slider with its exact value beside it */
  .ranged {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ranged-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ranged-row input[type="range"] {
    flex: 1;
    min-width: 0;
    height: 24px;
    margin: 0;
    background: transparent;
    appearance: none;
    cursor: pointer;
  }

  .ranged-row input[type="range"]::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(
      90deg,
      var(--sc-accent, var(--ink)) var(--fill),
      var(--sc-border, var(--line)) var(--fill)
    );
  }

  .ranged-row input[type="range"]::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(
      90deg,
      var(--sc-accent, var(--ink)) var(--fill),
      var(--sc-border, var(--line)) var(--fill)
    );
  }

  .ranged-row input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -6px;
    border-radius: 50%;
    background: var(--sc-background, var(--card));
    border: 2px solid var(--sc-accent, var(--ink));
  }

  .ranged-row input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sc-background, var(--card));
    border: 2px solid var(--sc-accent, var(--ink));
  }

  .ranged-row input[type="range"]:focus-visible {
    outline: 2px solid var(--sc-accent, var(--ink));
    outline-offset: 3px;
    border-radius: 4px;
  }

  .ranged-value {
    width: 4.8em;
    height: 34px;
    padding: 0 6px 0 10px;
    font: inherit;
    font-variant-numeric: tabular-nums;
    color: var(--sc-text, var(--ink));
    background: var(--sc-surface, var(--card));
    border: 1px solid var(--sc-border, var(--line));
    border-radius: var(--sc-radius, 8px);
  }

  .ranged-value:focus-visible {
    outline: none;
    border-color: var(--sc-accent, var(--ink));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc-accent, var(--ink)) 18%, transparent);
  }

  /* the matrix entries, in brackets */
  .matrix-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-name {
    font-weight: 500;
    font-size: 0.93em;
  }

  .matrix-input {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 6.5em));
    gap: 8px 10px;
    align-self: flex-start;
    padding: 6px 14px;
  }

  .matrix-input::before,
  .matrix-input::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 7px;
    border: 2px solid var(--ink);
  }

  .matrix-input::before {
    left: 0;
    border-right: 0;
  }

  .matrix-input::after {
    right: 0;
    border-left: 0;
  }

  .cell {
    width: 100%;
    height: 38px;
    padding: 0 8px;
    font-family: var(--math);
    font-size: 17px;
    text-align: center;
    color: var(--sc-text, var(--ink));
    background: var(--sc-surface, var(--card));
    border: 1px solid var(--sc-border, var(--line));
    border-bottom: 2px solid var(--col);
    border-radius: 6px;
    font-variant-numeric: tabular-nums;
  }

  .cell.i {
    --col: var(--i-hat);
  }

  .cell.j {
    --col: var(--j-hat);
  }

  .cell:focus-visible {
    outline: 2px solid var(--sc-accent, var(--ink));
    outline-offset: 1px;
  }

  .hint {
    font-size: 0.86em;
    color: var(--muted);
  }

  .hint b {
    font-family: var(--math);
  }

  .hint .i {
    color: var(--i-hat);
  }

  .hint .j {
    color: var(--j-hat);
  }

  /* the display toggles, keyed to the plot by a swatch before each */
  .toggle {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .switch {
    flex: 1;
    min-width: 0;
  }

  .swatch {
    flex: none;
    width: 20px;
    height: 12px;
    margin-top: 0.45em;
    border-radius: 3px;
  }

  .swatch.basis {
    background:
      linear-gradient(var(--i-hat), var(--i-hat)) left 0 top 2px / 100% 3px no-repeat,
      linear-gradient(var(--j-hat), var(--j-hat)) left 0 bottom 2px / 100% 3px no-repeat;
  }

  .swatch.determinant {
    border: 1.5px solid var(--det-pos);
    background: color-mix(in srgb, var(--det-pos) 22%, transparent);
  }

  .swatch.eigenvectors {
    background: repeating-linear-gradient(90deg, var(--eigen) 0 5px, transparent 5px 8px) center / 100% 3px no-repeat;
  }

  /* adding steps */
  .add {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .add-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .add-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .add button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 11px 0 9px;
    font: inherit;
    font-size: 13px;
    color: var(--sc-text, var(--ink));
    background: transparent;
    border: 1px dashed var(--sc-border, var(--line));
    border-radius: 999px;
    cursor: pointer;
    transition:
      border-color 120ms,
      background 120ms;
  }

  .add button:hover {
    border-style: solid;
    border-color: var(--ink);
    background: color-mix(in srgb, var(--line) 40%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .step,
    .play,
    .add button {
      transition: none;
    }

    .play:hover {
      transform: none;
    }
  }
</style>

<!-- ---- examples: pages on the dev server ---- -->

<!-- the explorer as it opens, in the minimal theme -->
{#snippet explorerInMinimal(Matrix: typeof Self)}
  <Matrix />
{/snippet}

<!-- the same form drawn by the material theme: the renderers wrap its components -->
{#snippet explorerInMaterial(
  Matrix: typeof Self,
  all: typeof themes,
  make: typeof explorer,
)}
  <Matrix
    theme={all.material}
    model={make({
      steps: [
        { type: "reflection", axis: "y" },
        { type: "scale", x: 1.5, y: 0.75 },
      ],
    })}
  />
{/snippet}

<!-- halfway through: the first step done, a quarter turn underway -->
{#snippet halfwayThrough(Matrix: typeof Self, make: typeof explorer)}
  <Matrix
    t={0.75}
    model={make({
      steps: [
        { type: "scale", x: 2, y: 1 },
        { type: "rotation", degrees: 90 },
      ],
    })}
  />
{/snippet}

<!-- a raw matrix: the tuple of tuples, set as a bracketed grid of inputs -->
{#snippet aRawMatrix(Matrix: typeof Self, make: typeof explorer)}
  <Matrix
    model={make({
      steps: [
        {
          type: "matrix",
          matrix: [
            [2, 1],
            [1, 2],
          ],
        },
      ],
      shape: "Circle",
    })}
  />
{/snippet}

<!-- ---- tests: the form drives the matrix and the plot ---- -->

{#snippet aQuarterTurnSendsIHatToJHat(
  Matrix: typeof Self,
  make: typeof explorer,
  read: typeof entries,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <Matrix model={make({ steps: [{ type: "rotation", degrees: 30 }] })} />
  </div>
  {test(async ({ expect, user, waitFor }) => {
    const angle = await waitFor(() => {
      const input = pocket.el.querySelector<HTMLInputElement>(
        '[data-path="steps.0.degrees"] input[type="number"]',
      );
      expect(input).not.toBeNull();
      return input!;
    });
    await user.clear(angle);
    await user.type(angle, "90");
    expect(read(pocket.el, '[data-readout="matrix"]')).toEqual(["0", "−1", "1", "0"]);
    const iHat = pocket.el.querySelector('[data-vector="i"]');
    expect(iHat?.getAttribute("data-to")).toBe("(0, 1)");
    expect(pocket.el.querySelector('[data-legend="i"]')?.textContent).toContain("(0, 1)");
  })}
{/snippet}

{#snippet theDialTurnsWithTheArrowKeys(
  Matrix: typeof Self,
  make: typeof explorer,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  {@const model = make({ steps: [{ type: "rotation", degrees: 90 }] })}
  <div bind:this={pocket.el}>
    <Matrix {model} />
  </div>
  {test(async ({ expect, user, within }) => {
    const dial = await within(pocket.el).findByRole("slider", { name: "Angle" });
    dial.focus();
    await user.keyboard("{ArrowUp}");
    expect(model.data.steps[0]).toEqual({ type: "rotation", degrees: 95 });
    await user.keyboard("{PageDown}");
    expect(dial.getAttribute("aria-valuenow")).toBe("50");
  })}
{/snippet}

{#snippet aReflectionMakesTheDeterminantNegative(
  Matrix: typeof Self,
  make: typeof explorer,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <Matrix model={make({ steps: [{ type: "rotation", degrees: 30 }] })} />
  </div>
  {test(async ({ expect, user, within }) => {
    const det = () => pocket.el.querySelector('[data-readout="determinant"]');
    expect(det()?.textContent).toBe("1");
    const picker = await within(pocket.el).findByRole("combobox", { name: "Step 1 type" });
    await user.selectOptions(picker, "reflection");
    expect(det()?.textContent).toBe("−1");
    expect(pocket.el.querySelector('[data-readout="orientation"]')?.textContent).toBe(
      "orientation flipped",
    );
    expect(pocket.el.querySelector(".area")?.getAttribute("data-sign")).toBe("-1");
  })}
{/snippet}

{#snippet addingAStepComposes(
  Matrix: typeof Self,
  make: typeof explorer,
  read: typeof entries,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  {@const model = make({ steps: [{ type: "rotation", degrees: 90 }] })}
  <div bind:this={pocket.el}>
    <Matrix {model} />
  </div>
  {test(async ({ expect, user, within }) => {
    await user.click(await within(pocket.el).findByRole("button", { name: "Scale" }));
    expect(model.data.steps).toHaveLength(2);
    // a scale by (2, 1) after a quarter turn: S · R
    expect(read(pocket.el, '[data-readout="matrix"]')).toEqual(["0", "−2", "1", "0"]);
    expect(pocket.el.querySelector('[data-readout="product"]')?.textContent).toBe(
      "S(2, 1) · R(90°)",
    );
    expect(pocket.el.querySelector('[data-readout="determinant"]')?.textContent).toBe("2");
  })}
{/snippet}

{#snippet movingAStepChangesTheProduct(
  Matrix: typeof Self,
  make: typeof explorer,
  read: typeof entries,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <Matrix
      model={make({
        steps: [
          { type: "shear", x: 1, y: 0 },
          { type: "rotation", degrees: 90 },
        ],
      })}
    />
  </div>
  {test(async ({ expect, user, within }) => {
    const matrix = () => read(pocket.el, '[data-readout="matrix"]');
    // shear first, then turn
    expect(matrix()).toEqual(["0", "−1", "1", "1"]);
    await user.click(await within(pocket.el).findByRole("button", { name: "Move step 2 up" }));
    // turn first, then shear
    expect(matrix()).toEqual(["1", "−1", "1", "0"]);
    await user.click(await within(pocket.el).findByRole("button", { name: "Remove step 1" }));
    expect(matrix()).toEqual(["1", "1", "0", "1"]);
  })}
{/snippet}

{#snippet theMatrixGridEditsItsEntries(
  Matrix: typeof Self,
  make: typeof explorer,
  read: typeof entries,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  {@const model = make({
    steps: [
      {
        type: "matrix",
        matrix: [
          [1, 0],
          [0, 1],
        ],
      },
    ],
  })}
  <div bind:this={pocket.el}>
    <Matrix {model} />
  </div>
  {test(async ({ expect, user, within }) => {
    const b = await within(pocket.el).findByRole("spinbutton", { name: "b: row 1, column 2" });
    expect(pocket.el.querySelectorAll(".matrix-input input")).toHaveLength(4);
    await user.clear(b);
    await user.type(b, "2");
    expect(model.data.steps[0]).toEqual({
      type: "matrix",
      matrix: [
        [1, 2],
        [0, 1],
      ],
    });
    expect(read(pocket.el, '[data-readout="matrix"]')).toEqual(["1", "2", "0", "1"]);
    // a shear: one eigenvector, along the x-axis
    expect(pocket.el.querySelector('[data-readout="eigen"]')?.textContent).toContain(
      "(twice)",
    );
    expect(pocket.el.querySelectorAll("[data-eigen]")).toHaveLength(1);
  })}
{/snippet}

{#snippet theShapeAndTogglesDriveThePlot(
  Matrix: typeof Self,
  make: typeof explorer,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <Matrix model={make({ steps: [{ type: "scale", x: 2, y: 1 }] })} />
  </div>
  {test(async ({ expect, user, within }) => {
    const plot = () => pocket.el.querySelector("svg.plane")!;
    await user.click(await within(pocket.el).findByRole("radio", { name: "Circle" }));
    expect(plot().getAttribute("data-shape")).toBe("Circle");
    expect(plot().querySelectorAll("[data-eigen]")).toHaveLength(2);
    await user.click(await within(pocket.el).findByRole("checkbox", { name: "Eigenvectors" }));
    expect(plot().querySelectorAll("[data-eigen]")).toHaveLength(0);
    await user.click(await within(pocket.el).findByRole("checkbox", { name: "Basis vectors" }));
    expect(plot().querySelector("[data-vector]")).toBeNull();
  })}
{/snippet}

{#snippet theSliderTweensFromTheIdentity(
  Matrix: typeof Self,
  make: typeof explorer,
  read: typeof entries,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <Matrix model={make({ steps: [{ type: "scale", x: 3, y: 1 }] })} />
  </div>
  {test(async ({ expect, fireEvent, within }) => {
    const iHat = () => pocket.el.querySelector('[data-vector="i"]')?.getAttribute("data-to");
    const slider = await within(pocket.el).findByRole("slider", { name: /^Tween/ });
    expect(iHat()).toBe("(3, 0)");
    await fireEvent.input(slider, { target: { value: "0" } });
    expect(iHat()).toBe("(1, 0)");
    await fireEvent.input(slider, { target: { value: "0.5" } });
    expect(iHat()).toBe("(2, 0)");
    // the composed matrix is the destination, whatever the tween shows
    expect(read(pocket.el, '[data-readout="matrix"]')).toEqual(["3", "0", "0", "1"]);
  })}
{/snippet}
