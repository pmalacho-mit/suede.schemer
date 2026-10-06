<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import {
    Model,
    Schema,
    controls,
    defaults,
    root,
    themes,
    type Theme,
  } from "../../../release";
  import type { Field } from "../../../release/components/Field.svelte";
  // what a custom array renderer hands each item: the item's node, its path
  // resolved. Every theme's Array uses it, but it is not in the public API.
  import { arrayItemAtIndex } from "../../../release/components/naming.ts";
  import EnvelopeDisplay from "./EnvelopeDisplay.svelte";
  import FilterDisplay from "./FilterDisplay.svelte";
  import Keyboard from "./Keyboard.svelte";
  import Knob from "./Knob.svelte";
  import WaveDisplay from "./WaveDisplay.svelte";
  import { Engine } from "./engine.ts";
  import { glyphPoints, pathOf } from "./geometry.ts";
  import { computerKeys, noteName, semitoneOf } from "./notes.ts";
  import {
    format,
    fromControl,
    paramOf,
    params,
    rangeOf,
    toControl,
    toPosition,
    type Param,
  } from "./params.ts";
  import {
    defaultFor,
    matchPreset,
    moved,
    normalize,
    preset,
    presetNames,
    presets,
    schema,
    switchVariant,
    waves,
    type Patch,
    type PresetName,
    type Wave,
  } from "./patch.ts";
  import type Self from "./Synthesizer.svelte";
  import type { Test } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";

  /**
   * A playable synthesizer whose patch is a JSON Schema form. The model holds
   * the patch; the form edits it, the displays draw it, and the sound follows
   * it, live, while notes are held.
   */
  let {
    theme = themes.terminal,
    program = "Warm pad",
    model = new Model("edit", preset(program)),
  }: {
    /** the library theme the panel is drawn in (terminal and brutalist have their own frames) */
    theme?: Theme;
    /** the preset to start from, when no model is given */
    program?: PresetName;
    /** the patch: pass one in to read or drive it from outside */
    model?: Model<"edit", Patch>;
  } = $props();

  const uid = $props.id();
  const tree = root(schema);

  /** the patch, whole: what the sound and the displays read */
  const patch = $derived(normalize(model.data));
  const active = $derived(matchPreset(model.data));

  const engine = new Engine(untrack(() => patch));
  $effect(() => engine.update(patch));
  onDestroy(() => engine.dispose());

  /** the notes sounding */
  const held = new SvelteSet<number>();
  let audio = $state<"idle" | "on" | "none">("idle");
  /** the keyboard's lowest note: C3 */
  let lowest = $state(48);
  /** which note each computer key started, so it stops that one even after an octave change */
  const typed = new Map<string, number>();

  const press = (midi: number) => {
    if (held.has(midi)) return;
    held.add(midi);
    // the first note is the gesture the browser waits for before any sound
    audio = engine.start() ? "on" : "none";
    engine.noteOn(midi);
  };

  const release = (midi: number) => {
    if (!held.delete(midi)) return;
    engine.noteOff(midi);
  };

  const releaseAll = () => {
    typed.clear();
    for (const midi of [...held]) release(midi);
  };

  const shift = (by: number) =>
    (lowest = Math.max(24, Math.min(84, lowest + by)));

  /** whether a key press is someone typing into a field, not playing */
  const typing = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.matches(
        "input:not([type=range]):not([type=radio]), select, textarea",
      ));

  const onkeydown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey || typing(event.target))
      return;
    const key = event.key.toLowerCase();
    if (key === "z" || key === "x") {
      if (!event.repeat) shift(key === "z" ? -12 : 12);
      return;
    }
    const semitone = semitoneOf(key);
    if (semitone === undefined) return;
    event.preventDefault();
    if (event.repeat || typed.has(key)) return;
    typed.set(key, lowest + semitone);
    press(lowest + semitone);
  };

  const onkeyup = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const midi = typed.get(key);
    if (midi === undefined) return;
    typed.delete(key);
    release(midi);
  };

  const load = (name: PresetName) => {
    model.data = preset(name);
  };

  /** a wave's icon: one cycle, drawn by the same code as the display */
  const glyph = (wave: Wave) =>
    pathOf(
      glyphPoints(wave, { width: 22, height: 10 }).map(
        ([x, y]) => [x + 1, y + 2] as const,
      ),
    );

  const isWave = (option: unknown): option is Wave =>
    waves.includes(option as Wave);

  /** what an array's path renderer is typed to take (see the oscillators renderer) */
  type ArrayRendererProps = Field.Props<"array"> | Field.ArrayActionProps;

  /** an array's path renderer is only ever called with a field's props: those have `renderChild` */
  const asField = (props: ArrayRendererProps): Field.Props<"array"> => {
    if (!("renderChild" in props))
      throw new Error(`${props.node.path} was drawn as an array action`);
    return props;
  };

  /** a number field's parameter, with the range its schema gives */
  const paramFor = (node: Field.Props<"number">["node"]): Param | undefined => {
    const param = paramOf(node.path);
    return param && { ...param, min: node.min ?? param.min, max: node.max ?? param.max };
  };

  const look = $derived(theme.name === "brutalist" ? "brutalist" : "dark");
  const notes = $derived(
    [...held]
      .sort((a, b) => a - b)
      .map(noteName)
      .join(" "),
  );
</script>

<svelte:window {onkeydown} {onkeyup} onblur={releaseAll} />
<svelte:document onvisibilitychange={() => document.hidden && releaseAll()} />

<!-- ====================================================================== -->
<!-- Renderers: what <Schema> draws each field with, over the theme         -->
<!-- ====================================================================== -->

<!-- by kind: every object. The root is the rack of modules; any other object is a row of controls -->
{#snippet object({ node, renderChild }: Field.Props<"object">)}
  {#if node.path === ""}
    <div class="rack">
      {#each node.children as child (child.path)}
        {#if child.kind === "string"}
          <!-- the patch name: drawn by the theme, as a theme draws any text field -->
          <div class="nameplate">{@render renderChild(child, "object")}</div>
        {:else}
          <section
            class="module"
            data-module={child.path}
            aria-labelledby="{uid}-{child.path}-heading"
          >
            <header class="module-head">
              <h3 id="{uid}-{child.path}-heading">{child.title}</h3>
              {#if child.description}<p>{child.description}</p>{/if}
            </header>
            {@render renderChild(child, "object")}
          </section>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="row">
      {#each node.children as child (child.path)}
        {@render renderChild(child, "object")}
      {/each}
    </div>
  {/if}
{/snippet}

<!-- by kind: every number, a fader or a knob as its parameter says; the theme's own for any other -->
{#snippet number({ node, model }: Field.Props<"number">)}
  {@const param = paramFor(node)}
  {#if param}
    {@const value = model.get(node) ?? node.default ?? param.default}
    {#if param.style === "knob"}
      {@render dial(node, model, param, value, "medium")}
    {:else}
      {@render fader(node, model, param, value)}
    {/if}
  {:else}
    {@const Fallback = theme.byKind?.number ?? defaults.component.byKind.number}
    <Fallback {node} {model} />
  {/if}
{/snippet}

<!-- by kind: every string. A const (a variant's tag) is not drawn, options are a row of buttons, and text is the theme's -->
{#snippet string(props: Field.Props<"string">)}
  {@const { node, model } = props}
  {#if node.const !== undefined}
    <!-- the variant switch above already says which this is -->
  {:else if node.options}
    <div class="choice">
      <span class="name" id="{uid}-{node.path}-label">{node.title}</span>
      <div
        class="segmented"
        role="radiogroup"
        aria-labelledby="{uid}-{node.path}-label"
      >
        {#each node.options as option (option)}
          <label class="segment" title={option}>
            <input
              type="radio"
              name="{uid}-{node.path}"
              value={option}
              checked={model.get(node) === option}
              disabled={!model.editable}
              onchange={model.on(node)}
            />
            {#if isWave(option)}
              <svg class="glyph" viewBox="0 0 24 14" aria-hidden="true">
                <path d={glyph(option)} />
              </svg>
              <span class="sr-only">{option}</span>
            {:else}
              {option}
            {/if}
          </label>
        {/each}
      </div>
    </div>
  {:else}
    {@const Fallback = theme.byKind?.string ?? defaults.component.byKind.string}
    <Fallback {...props} />
  {/if}
{/snippet}

<!-- by kind: every oneOf, a switch of its variants; switching fills in the new variant's defaults -->
{#snippet oneOf({ node, model, renderChild }: Field.Props<"oneOf">)}
  {@const selected = controls.variants.selected(node, model)}
  <div class="variant">
    <div
      class="segmented words"
      role="radiogroup"
      aria-label="{node.title ?? 'Variant'} type"
    >
      {#each node.variants as variant, i (i)}
        <label class="segment">
          <input
            type="radio"
            name="{uid}-{node.path}"
            checked={i === selected}
            disabled={!model.editable}
            onchange={() =>
              model.set(node, switchVariant(model.get(node), defaultFor(variant)))}
          />
          {controls.variants.label(variant, i)}
        </label>
      {/each}
    </div>
    {#if selected >= 0}
      {@render renderChild(node.variants[selected], "oneOf")}
    {/if}
  </div>
{/snippet}

<!--
  by path: the oscillators, a card each. (An array's path renderer is typed as
  its push/splice/insert renderer too, as both share the key "oscillators": it
  is only ever called as a field renderer, so it takes the union and narrows.)
-->
{#snippet oscillators(props: ArrayRendererProps)}
  {@const { node, model, renderChild } = asField(props)}
  {@const items = controls.array.items(node, model)}
  <ol class="voices">
    {#each items as _, i (i)}
      <li class="voice">
        <div class="tag">
          <span>OSC {i + 1}</span>
          {#if model.editable && items.length > (node.minItems ?? 0)}
            <button
              type="button"
              class="mini"
              aria-label="Remove oscillator {i + 1}"
              onclick={() => controls.actions.splice(node, model, i)}>×</button
            >
          {/if}
        </div>
        {@render renderChild(arrayItemAtIndex(node, i), "array", i)}
      </li>
    {/each}
  </ol>
  {#if controls.array.addable(node, model)}
    <button
      type="button"
      class="add"
      onclick={() => model.get(node)?.push(defaultFor(node.itemNode))}
    >
      <span aria-hidden="true">+</span> Add oscillator
    </button>
  {/if}
{/snippet}

<!--
  by path: the filter, its response on a screen above the switch the oneOf
  renderer draws. A variant has its oneOf's path, so this draws the chosen
  variant too: that is a row, as any object. (The renderer is typed from the
  data's TypeScript type, where a union of objects is an "object".)
-->
{#snippet filter(props: Field.Props<"object">)}
  {@const field = props as Field.Props<"object"> | Field.Props<"oneOf">}
  {#if field.node.kind === "oneOf"}
    <div class="scope">
      <FilterDisplay filter={patch.filter} />
    </div>
    {@render oneOf(field as Field.Props<"oneOf">)}
  {:else}
    {@render object(props)}
  {/if}
{/snippet}

<!-- by path: the envelope, as four upright faders -->
{#snippet envelope({ node, renderChild }: Field.Props<"object">)}
  <div class="faders">
    {#each node.children as child (child.path)}
      {@render renderChild(child, "object")}
    {/each}
  </div>
{/snippet}

<!-- by path: the effects, a pedal each, in the order the signal passes through them -->
{#snippet effects(props: ArrayRendererProps)}
  {@const { node, model, renderChild } = asField(props)}
  {@const items = controls.array.items(node, model)}
  {@const kinds = node.itemNode.kind === "oneOf" ? node.itemNode.variants : []}
  {#if items.length === 0}
    <p class="empty">No effects: the filter goes straight to the master.</p>
  {/if}
  <ol class="pedals">
    {#each items as _, i (i)}
      <li class="pedal">
        <div class="tag">
          <span>FX {i + 1}</span>
          {#if model.editable}
            <span class="tools">
              <button
                type="button"
                class="mini"
                aria-label="Move effect {i + 1} earlier"
                disabled={i === 0}
                onclick={() => model.set(node, moved(items, i, -1))}>◂</button
              >
              <button
                type="button"
                class="mini"
                aria-label="Move effect {i + 1} later"
                disabled={i === items.length - 1}
                onclick={() => model.set(node, moved(items, i, 1))}>▸</button
              >
              <button
                type="button"
                class="mini"
                aria-label="Remove effect {i + 1}"
                onclick={() => controls.actions.splice(node, model, i)}>×</button
              >
            </span>
          {/if}
        </div>
        {@render renderChild(arrayItemAtIndex(node, i), "array", i)}
      </li>
    {/each}
  </ol>
  {#if controls.array.addable(node, model)}
    <div class="adders">
      {#each kinds as kind, k (k)}
        <button
          type="button"
          class="add"
          onclick={() => model.get(node)?.push(defaultFor(kind))}
        >
          <span aria-hidden="true">+</span><span class="sr-only">Add</span>
          {controls.variants.label(kind, k)}
        </button>
      {/each}
    </div>
  {/if}
{/snippet}

<!-- by path: the master volume, the big knob, with a level meter that lights while notes sound -->
{#snippet volume({ node, model }: Field.Props<"number">)}
  {@const param = paramFor(node) ?? params.volume}
  {@const value = model.get(node) ?? param.default}
  {@const lit = held.size ? Math.round(value * 8) : 0}
  <div class="master">
    {@render dial(node, model, param, value, "large")}
    <div class="meter" aria-hidden="true">
      {#each Array.from({ length: 8 }, (_, i) => 7 - i) as i (i)}
        <span class="segment-led" class:lit={i < lit} class:hot={i >= 6}></span>
      {/each}
    </div>
  </div>
{/snippet}

<!-- the controls the renderers above share -->
{#snippet fader(
  node: Field.Props<"number">["node"],
  model: Model,
  param: Param,
  value: number,
)}
  {@const id = `${uid}-${node.path}`}
  {@const range = rangeOf(param)}
  <div class="fader" style:--fill={toPosition(value, param)}>
    <label class="name" for={id}>{node.title}</label>
    <input
      {id}
      type="range"
      min={range.min}
      max={range.max}
      step={range.step}
      value={toControl(value, param)}
      aria-valuetext={format(value, param)}
      aria-describedby={node.description ? `${id}-about` : undefined}
      disabled={!model.editable}
      oninput={model.on(node, (raw) => fromControl(Number(raw), param))}
      ondblclick={() => model.set(node, param.default)}
    />
    <output for={id}>{format(value, param)}</output>
    {#if node.description}
      <span class="sr-only" id="{id}-about">{node.description}</span>
    {/if}
  </div>
{/snippet}

{#snippet dial(
  node: Field.Props<"number">["node"],
  model: Model,
  param: Param,
  value: number,
  size: "medium" | "large",
)}
  <div class="dial {size}" title={node.description}>
    <Knob
      {value}
      {param}
      {size}
      label={node.title ?? node.path}
      disabled={!model.editable}
      onchange={(next) => model.set(node, next)}
    />
    <span class="name" aria-hidden="true">{node.title}</span>
    <output>{format(value, param)}</output>
  </div>
{/snippet}

<!-- ====================================================================== -->
<!-- The instrument                                                         -->
<!-- ====================================================================== -->

<div class="synth" data-look={look}>
  <div class="chassis">
    <header class="head">
      <div class="brand">
        <span class="badge" aria-hidden="true">S·3</span>
        <div class="maker">
          <strong>Schemer</strong>
          <span>Three-oscillator synthesizer · drawn from a JSON Schema</span>
        </div>
      </div>
      <div class="power" class:on={audio === "on"}>
        <span class="led" aria-hidden="true"></span>
        <span>{audio === "none" ? "No Web Audio" : audio === "on" ? "Sound on" : "Play a key to start"}</span>
      </div>
    </header>

    <section class="screen" aria-label="Display">
      <div class="readout">
        <span class="slot">{active ? `P${presetNames.indexOf(active) + 1}` : "EDIT"}</span>
        <span class="title">{patch.name || "Untitled"}{active ? "" : "*"}</span>
        <span class="playing" data-testid="playing">{notes || "—"}</span>
      </div>
      <figure class="pane">
        <WaveDisplay oscillators={patch.oscillators} />
        <figcaption>Oscillators</figcaption>
      </figure>
      <figure class="pane">
        <EnvelopeDisplay envelope={patch.envelope} active={held.size > 0} />
        <figcaption>Envelope</figcaption>
      </figure>
    </section>

    <nav class="programs" aria-label="Presets">
      {#each presetNames as name, i (name)}
        <button
          type="button"
          class="program"
          aria-pressed={active === name}
          onclick={() => load(name)}
        >
          <span class="led" aria-hidden="true"></span>
          <span class="number" aria-hidden="true">{i + 1}</span>
          {name}
        </button>
      {/each}
    </nav>

    <div class="panel">
      {#await tree then node}
        <Schema
          root={node}
          {model}
          {theme}
          {object}
          {number}
          {string}
          {oneOf}
          {oscillators}
          {envelope}
          {filter}
          {effects}
          {volume}
        />
      {/await}
    </div>

    <div class="deck">
      <div class="octave" role="group" aria-label="Octave">
        <button
          type="button"
          aria-label="Octave down"
          aria-keyshortcuts="Z"
          disabled={lowest <= 24}
          onclick={() => shift(-12)}>−</button
        >
        <output aria-label="Lowest key">{noteName(lowest)}</output>
        <button
          type="button"
          aria-label="Octave up"
          aria-keyshortcuts="X"
          disabled={lowest >= 84}
          onclick={() => shift(12)}>+</button
        >
      </div>
      <div class="keys">
        <Keyboard {lowest} {held} onpress={press} onrelease={release} />
      </div>
    </div>
    <p class="hint">
      Play with
      {#each computerKeys as key}<kbd>{key.toUpperCase()}</kbd>{/each}
      · octave <kbd>Z</kbd><kbd>X</kbd> · double-click a control to reset it
    </p>
  </div>
</div>

<style>
  /* ---------------------------------------------------------------------- */
  /* Looks: the instrument's own colours, under whichever theme draws the form */
  /* ---------------------------------------------------------------------- */

  .synth {
    --synth-font: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas,
      monospace;
    --synth-chassis: #1b1c20;
    --synth-cheek: #6b4426;
    --synth-panel: #24252a;
    --synth-module: #1e1f23;
    --synth-line: #34363c;
    --synth-ink: #ece6d8;
    --synth-ink-dim: #8f8a7f;
    --synth-accent: #ff7a2f;
    --synth-accent-ink: #1b0d03;
    --synth-accent-glow: rgb(255 122 47 / 0.55);
    --synth-groove: #0f1013;
    --synth-knob: #2c2d32;
    --synth-knob-edge: #0c0d0f;
    --synth-pointer: #f4efe4;
    --synth-screen: #07100b;
    --synth-screen-ink: #8dffb5;
    --synth-screen-dim: rgb(141 255 181 / 0.5);
    --synth-screen-grid: rgb(141 255 181 / 0.09);
    --synth-screen-glow: rgb(141 255 181 / 0.55);
    --synth-led-off: #3a1a12;
    --synth-led: #ff4a2a;
    --synth-radius: 10px;
    --synth-stroke: 1px;
    --synth-shadow: 0 1px 0 rgb(255 255 255 / 0.04) inset,
      0 10px 30px rgb(0 0 0 / 0.45);

    container-type: inline-size;
    font-family: var(--synth-font);
    color: var(--synth-ink);
    -webkit-font-smoothing: antialiased;
  }

  .synth[data-look="brutalist"] {
    --synth-font: "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
    --synth-chassis: #ffde59;
    --synth-cheek: #111;
    --synth-panel: #fff4e0;
    --synth-module: #ffffff;
    --synth-line: #111;
    --synth-ink: #111;
    --synth-ink-dim: #4d4a42;
    --synth-accent: #ff5c8a;
    --synth-accent-ink: #111;
    --synth-accent-glow: transparent;
    --synth-groove: #111;
    --synth-knob: #ffffff;
    --synth-knob-edge: #111;
    --synth-knob-rim: #111;
    --synth-knob-hover: #fff4e0;
    --synth-pointer: #111;
    --synth-screen: #111;
    --synth-screen-ink: #ffde59;
    --synth-screen-dim: rgb(255 222 89 / 0.6);
    --synth-screen-grid: rgb(255 222 89 / 0.14);
    --synth-screen-glow: transparent;
    --synth-screen-fill: rgb(255 222 89 / 0.16);
    --synth-screen-fill-active: rgb(255 222 89 / 0.3);
    --synth-led-off: #e8d9c6;
    --synth-led: #ff2a5f;
    --synth-radius: 0px;
    --synth-stroke: 3px;
    --synth-shadow: 8px 8px 0 #111;
    --synth-ivory: #ffffff;
    --synth-ivory-top: #ffffff;
    --synth-ivory-bottom: #ffffff;
    --synth-ivory-lip: #e9e2d2;
    --synth-key-gap: #111;
  }

  /* ---------------------------------------------------------------------- */
  /* The body                                                               */
  /* ---------------------------------------------------------------------- */

  .chassis {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
    grid-template-areas:
      "head head"
      "screen programs"
      "panel panel"
      "deck deck"
      "hint hint";
    gap: 14px 18px;
    padding: 18px 26px 16px;
    background:
      radial-gradient(120% 60% at 50% 0%, rgb(255 255 255 / 0.05), transparent 60%),
      var(--synth-chassis);
    border-radius: var(--synth-radius);
    /* the wooden end cheeks */
    border-inline: 14px solid var(--synth-cheek);
    box-shadow: var(--synth-shadow);
  }

  .synth[data-look="dark"] .chassis {
    border-image: repeating-linear-gradient(
        90deg,
        #5e3a20 0 3px,
        #74492a 3px 7px,
        #5a371e 7px 9px,
        #6d4527 9px 14px
      )
      1;
    border-radius: 0;
  }

  .synth[data-look="brutalist"] .chassis {
    border: var(--synth-stroke) solid #111;
    border-inline-width: 14px;
  }

  .head {
    grid-area: head;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px 16px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .badge {
    display: grid;
    place-items: center;
    padding: 4px 8px;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 0.04em;
    color: var(--synth-accent-ink);
    background: var(--synth-accent);
    border-radius: 4px;
  }

  .synth[data-look="brutalist"] .badge {
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 3px 3px 0 #111;
  }

  .maker {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .maker strong {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 0.32em;
    text-transform: uppercase;
  }

  .maker span {
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--synth-ink-dim);
  }

  .power {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--synth-ink-dim);
  }

  .led {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--synth-led-off);
    box-shadow: inset 0 1px 1px rgb(0 0 0 / 0.4);
  }

  .power.on .led,
  .program[aria-pressed="true"] .led {
    background: var(--synth-led);
    box-shadow: 0 0 6px var(--synth-led), 0 0 1px #fff inset;
  }

  .synth[data-look="brutalist"] .led {
    border: 2px solid #111;
    width: 10px;
    height: 10px;
  }

  /* ---------------------------------------------------------------------- */
  /* The screen                                                             */
  /* ---------------------------------------------------------------------- */

  .screen {
    grid-area: screen;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-content: center;
    gap: 6px 10px;
    padding: 10px 12px 8px;
  }

  /* the filter's own small screen */
  .scope {
    margin-bottom: 12px;
    padding: 6px 8px 4px;
  }

  .screen,
  .scope {
    color: var(--synth-screen-ink);
    background:
      repeating-linear-gradient(
        to bottom,
        rgb(255 255 255 / 0.025) 0 1px,
        transparent 1px 3px
      ),
      radial-gradient(130% 120% at 50% 0%, rgb(141 255 181 / 0.06), transparent 70%),
      var(--synth-screen);
    border-radius: 6px;
    box-shadow:
      inset 0 0 0 1px rgb(0 0 0 / 0.8),
      inset 0 2px 12px rgb(0 0 0 / 0.8),
      0 0 0 3px var(--synth-groove),
      0 0 0 4px rgb(255 255 255 / 0.05);
  }

  .synth[data-look="brutalist"] :is(.screen, .scope) {
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0 #111;
  }

  .readout {
    grid-column: 1 / -1;
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
    font-family: ui-monospace, "JetBrains Mono", Menlo, monospace;
    font-size: 13px;
    text-shadow: 0 0 6px var(--synth-screen-glow);
  }

  .readout .slot {
    padding: 0 5px;
    color: var(--synth-screen);
    background: var(--synth-screen-ink);
    border-radius: 2px;
    text-shadow: none;
  }

  .readout .title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .readout .playing {
    color: var(--synth-screen-dim);
    white-space: nowrap;
  }

  .pane {
    margin: 0;
    min-width: 0;
  }

  .pane figcaption {
    font-family: ui-monospace, "JetBrains Mono", Menlo, monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--synth-screen-dim);
  }

  /* ---------------------------------------------------------------------- */
  /* Program buttons                                                        */
  /* ---------------------------------------------------------------------- */

  .programs {
    grid-area: programs;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    align-content: space-between;
  }

  .program {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 8px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    color: var(--synth-ink);
    background: linear-gradient(to bottom, #34363c, #2a2b30);
    border: 1px solid #0d0e10;
    border-radius: 6px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.08),
      0 3px 0 #0d0e10;
    cursor: pointer;
  }

  .program .number {
    font-size: 11px;
    color: var(--synth-ink-dim);
  }

  .program:hover {
    background: linear-gradient(to bottom, #3b3d44, #303137);
  }

  .program:active,
  .program[aria-pressed="true"] {
    transform: translateY(2px);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.05),
      0 1px 0 #0d0e10;
  }

  .program:focus-visible,
  .octave button:focus-visible,
  .add:focus-visible,
  .mini:focus-visible {
    outline: 2px solid var(--synth-accent);
    outline-offset: 2px;
  }

  .synth[data-look="brutalist"] .program {
    color: #111;
    background: #fff;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0 #111;
  }

  .synth[data-look="brutalist"] .program:hover {
    background: #fff4e0;
  }

  .synth[data-look="brutalist"] .program[aria-pressed="true"],
  .synth[data-look="brutalist"] .program:active {
    background: var(--synth-accent);
    transform: translate(3px, 3px);
    box-shadow: 1px 1px 0 #111;
  }

  /* ---------------------------------------------------------------------- */
  /* The panel: the form, as a rack of modules                              */
  /* ---------------------------------------------------------------------- */

  .panel {
    grid-area: panel;
    min-width: 0;
    container-type: inline-size;
    --schemer-accent: var(--synth-accent);
    --schemer-accent-contrast: var(--synth-accent-ink);
    --schemer-text: var(--synth-ink);
    --schemer-muted: var(--synth-ink-dim);
    --schemer-background: transparent;
    --schemer-surface: var(--synth-module);
    --schemer-border: var(--synth-line);
    --schemer-font: var(--synth-font);
  }

  /* the theme's container frames a form; here the chassis does */
  .panel :global([data-theme]) {
    margin: 0;
    padding: 0;
    border: 0;
    box-shadow: none;
    background: transparent;
  }

  .rack {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 12px;
  }

  .nameplate {
    grid-column: 1 / -1;
    max-width: 420px;
  }

  .module {
    grid-column: span 12;
    min-width: 0;
    padding: 10px 12px 12px;
    background: var(--synth-panel);
    border: var(--synth-stroke) solid var(--synth-line);
    border-radius: 8px;
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04);
  }

  .synth[data-look="brutalist"] .module {
    border-radius: 0;
    box-shadow: 4px 4px 0 #111;
  }

  @container (min-width: 640px) {
    .module[data-module="oscillators"] {
      grid-column: span 12;
    }
    .module[data-module="envelope"] {
      grid-column: span 7;
    }
    .module[data-module="filter"] {
      grid-column: span 5;
    }
    .module[data-module="effects"] {
      grid-column: span 8;
    }
    .module[data-module="volume"] {
      grid-column: span 4;
    }
  }

  @container (min-width: 980px) {
    .module[data-module="oscillators"] {
      grid-column: span 7;
    }
    .module[data-module="envelope"] {
      grid-column: span 5;
    }
    .module[data-module="filter"] {
      grid-column: span 3;
    }
    .module[data-module="effects"] {
      grid-column: span 7;
    }
    .module[data-module="volume"] {
      grid-column: span 2;
    }
  }

  .module-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 2px 10px;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--synth-line);
  }

  .module-head h3 {
    margin: 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--synth-accent);
  }

  .synth[data-look="brutalist"] .module-head h3 {
    color: #111;
    font-size: 13px;
  }

  .module-head p {
    margin: 0;
    font-size: 11px;
    color: var(--synth-ink-dim);
  }

  .name {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--synth-ink-dim);
  }

  output {
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    color: var(--synth-ink);
  }

  /* a row of controls (an oscillator, a variant's fields) */
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 10px 14px;
  }

  .row > :global(div[data-kind]) {
    flex: 1 1 96px;
    min-width: 0;
  }

  /* a variant's fields are knobs: as many to a row as fit */
  .variant .row {
    justify-content: space-around;
  }

  .variant .row > :global(div[data-kind="number"]) {
    flex: 0 1 72px;
  }

  .row > :global(div[data-kind="string"]) {
    flex: 0 0 auto;
  }

  .row > :global(div[data-kind]:empty) {
    display: none;
  }

  /* ---------------------------------------------------------------------- */
  /* Faders                                                                 */
  /* ---------------------------------------------------------------------- */

  .fader {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: "name value" "input input";
    align-items: baseline;
    gap: 2px 6px;
  }

  .fader .name {
    grid-area: name;
  }

  .fader output {
    grid-area: value;
  }

  .fader input {
    grid-area: input;
    --track: var(--synth-groove);
    --thumb-from: #f4f0e6;
    --thumb-to: #b7b0a2;
    width: 100%;
    height: 24px;
    margin: 0;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }

  .fader input::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(
      to right,
      var(--synth-accent) calc(var(--fill) * 100%),
      var(--track) 0
    );
    box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.6);
  }

  .fader input::-moz-range-track {
    height: 6px;
    border-radius: 3px;
    background: var(--track);
  }

  .fader input::-moz-range-progress {
    height: 6px;
    border-radius: 3px;
    background: var(--synth-accent);
  }

  .fader input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 22px;
    margin-top: -8px;
    border: 1px solid #000;
    border-radius: 3px;
    background:
      linear-gradient(to right, transparent 6px, #000 6px 7px, transparent 7px),
      linear-gradient(to bottom, var(--thumb-from), var(--thumb-to));
    box-shadow: 0 2px 3px rgb(0 0 0 / 0.5);
  }

  .fader input::-moz-range-thumb {
    width: 14px;
    height: 22px;
    border: 1px solid #000;
    border-radius: 3px;
    background:
      linear-gradient(to right, transparent 6px, #000 6px 7px, transparent 7px),
      linear-gradient(to bottom, var(--thumb-from), var(--thumb-to));
    box-shadow: 0 2px 3px rgb(0 0 0 / 0.5);
  }

  .fader input:focus-visible {
    outline: none;
  }

  .fader input:focus-visible::-webkit-slider-thumb {
    box-shadow:
      0 0 0 2px var(--synth-panel),
      0 0 0 4px var(--synth-accent);
  }

  .fader input:focus-visible::-moz-range-thumb {
    box-shadow:
      0 0 0 2px var(--synth-panel),
      0 0 0 4px var(--synth-accent);
  }

  .synth[data-look="brutalist"] .fader input {
    --track: #fff;
    --thumb-from: #111;
    --thumb-to: #111;
  }

  .synth[data-look="brutalist"] .fader input::-webkit-slider-runnable-track {
    border: 2px solid #111;
    border-radius: 0;
    height: 10px;
    box-shadow: none;
  }

  .synth[data-look="brutalist"] .fader input::-webkit-slider-thumb {
    margin-top: -8px;
    border-radius: 0;
    background: var(--synth-accent);
    border: 3px solid #111;
    box-shadow: 2px 2px 0 #111;
  }

  /* the envelope's faders stand upright, side by side, like a hardware ADSR */
  .faders {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .faders .fader {
    grid-template-columns: 1fr;
    grid-template-areas: "input" "value" "name";
    justify-items: center;
    gap: 6px;
  }

  .faders .fader input {
    writing-mode: vertical-lr;
    direction: rtl;
    width: 24px;
    height: 132px;
  }

  .faders .fader input::-webkit-slider-runnable-track {
    width: 6px;
    height: 100%;
    background: linear-gradient(
      to top,
      var(--synth-accent) calc(var(--fill) * 100%),
      var(--track) 0
    );
  }

  .faders .fader input::-webkit-slider-thumb {
    width: 24px;
    height: 14px;
    margin-top: 0;
    margin-left: -9px;
    background:
      linear-gradient(to bottom, transparent 6px, #000 6px 7px, transparent 7px),
      linear-gradient(to right, var(--thumb-from), var(--thumb-to));
  }

  .faders .fader input::-moz-range-track {
    width: 6px;
    height: 100%;
  }

  .faders .fader input::-moz-range-thumb {
    width: 24px;
    height: 14px;
  }

  .synth[data-look="brutalist"] .faders .fader input::-webkit-slider-runnable-track {
    width: 10px;
    height: 100%;
  }

  .synth[data-look="brutalist"] .faders .fader input::-webkit-slider-thumb {
    margin-left: -10px;
  }

  /* ---------------------------------------------------------------------- */
  /* Knobs                                                                  */
  /* ---------------------------------------------------------------------- */

  .dial {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .dial .name {
    margin-top: 2px;
  }

  .master {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding-top: 4px;
  }

  .meter {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .segment-led {
    width: 14px;
    height: 6px;
    border-radius: 1px;
    background: var(--synth-groove);
  }

  .segment-led.lit {
    background: var(--synth-screen-ink);
    box-shadow: 0 0 4px var(--synth-screen-glow);
  }

  .segment-led.lit.hot {
    background: var(--synth-led);
    box-shadow: 0 0 4px var(--synth-led);
  }

  .synth[data-look="brutalist"] .segment-led {
    background: #fff;
    border: 2px solid #111;
  }

  .synth[data-look="brutalist"] .segment-led.lit {
    background: #3ad07a;
  }

  .synth[data-look="brutalist"] .segment-led.lit.hot {
    background: var(--synth-led);
  }

  /* ---------------------------------------------------------------------- */
  /* Segmented switches: waves, filter types, effect types                  */
  /* ---------------------------------------------------------------------- */

  .choice {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .segmented {
    display: inline-flex;
    flex-wrap: wrap;
    padding: 2px;
    gap: 2px;
    background: var(--synth-groove);
    border-radius: 6px;
  }

  .segment {
    position: relative;
    display: grid;
    place-items: center;
    min-width: 30px;
    min-height: 28px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--synth-ink-dim);
    border-radius: 4px;
    cursor: pointer;
  }

  .segment input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .segment:hover {
    color: var(--synth-ink);
  }

  .segment:has(input:checked) {
    color: var(--synth-accent-ink);
    background: var(--synth-accent);
    box-shadow: 0 0 8px var(--synth-accent-glow);
  }

  .segment:has(input:focus-visible) {
    outline: 2px solid var(--synth-accent);
    outline-offset: 2px;
  }

  .segment:has(input:disabled) {
    cursor: default;
    opacity: 0.6;
  }

  .glyph {
    width: 24px;
    height: 14px;
  }

  .glyph path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linejoin: round;
  }

  .segmented.words {
    margin-bottom: 12px;
  }

  .synth[data-look="brutalist"] .segmented {
    background: #fff;
    border: 3px solid #111;
    border-radius: 0;
    padding: 0;
    gap: 0;
  }

  .synth[data-look="brutalist"] .segment {
    border-radius: 0;
    color: #111;
  }

  .synth[data-look="brutalist"] .segment:not(:last-child) {
    border-right: 2px solid #111;
  }

  .variant {
    display: flex;
    flex-direction: column;
  }

  /* ---------------------------------------------------------------------- */
  /* Oscillators and effects                                                */
  /* ---------------------------------------------------------------------- */

  .voices,
  .pedals {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .voices {
    flex-direction: column;
    gap: 8px;
  }

  .voice {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    padding: 8px 10px;
    background: var(--synth-module);
    border: 1px solid var(--synth-line);
    border-radius: 6px;
  }

  .tag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.14em;
    color: var(--synth-ink-dim);
    white-space: nowrap;
  }

  .voice > .tag {
    flex-direction: column;
    writing-mode: initial;
  }

  .pedals {
    flex-wrap: wrap;
    gap: 10px;
  }

  .pedal {
    flex: 1 1 210px;
    min-width: 0;
    padding: 8px 10px 12px;
    background: var(--synth-module);
    border: 1px solid var(--synth-line);
    border-radius: 6px;
    box-shadow: inset 0 -3px 0 rgb(0 0 0 / 0.25);
  }

  .pedal > .tag {
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .tools {
    display: flex;
    gap: 4px;
  }

  .synth[data-look="brutalist"] .voice,
  .synth[data-look="brutalist"] .pedal {
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: none;
  }

  .mini {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    font: inherit;
    font-size: 13px;
    line-height: 1;
    color: var(--synth-ink-dim);
    background: var(--synth-groove);
    border: 1px solid var(--synth-line);
    border-radius: 4px;
    cursor: pointer;
  }

  .mini:hover:not(:disabled) {
    color: var(--synth-accent-ink);
    background: var(--synth-accent);
  }

  .mini:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .adders {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .add {
    margin-top: 10px;
    min-height: 32px;
    padding: 4px 12px;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--synth-ink);
    background: transparent;
    border: 1px dashed var(--synth-ink-dim);
    border-radius: 6px;
    cursor: pointer;
  }

  .adders .add {
    margin-top: 0;
  }

  .add:hover {
    color: var(--synth-accent-ink);
    background: var(--synth-accent);
    border-style: solid;
    border-color: var(--synth-accent);
  }

  .synth[data-look="brutalist"] .mini,
  .synth[data-look="brutalist"] .add {
    color: #111;
    background: #fff;
    border: 2px solid #111;
    border-radius: 0;
  }

  .synth[data-look="brutalist"] .add:hover,
  .synth[data-look="brutalist"] .mini:hover:not(:disabled) {
    background: var(--synth-accent);
  }

  .empty {
    margin: 0 0 4px;
    font-size: 11px;
    color: var(--synth-ink-dim);
  }

  /* ---------------------------------------------------------------------- */
  /* The keyboard deck                                                      */
  /* ---------------------------------------------------------------------- */

  .deck {
    grid-area: deck;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: stretch;
    gap: 12px;
    padding: 10px;
    background: var(--synth-groove);
    border-radius: 8px;
    box-shadow: inset 0 3px 10px rgb(0 0 0 / 0.6);
  }

  .synth[data-look="brutalist"] .deck {
    background: #111;
    border-radius: 0;
  }

  .octave {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 0 4px;
  }

  .octave output {
    font-size: 11px;
    color: var(--synth-ink-dim);
  }

  .octave button {
    width: 40px;
    height: 40px;
    font: inherit;
    font-size: 18px;
    font-weight: 700;
    color: var(--synth-ink);
    background: linear-gradient(to bottom, #34363c, #26272c);
    border: 1px solid #000;
    border-radius: 6px;
    box-shadow: 0 2px 0 #000;
    cursor: pointer;
  }

  .octave button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .synth[data-look="brutalist"] .octave button {
    color: #111;
    background: var(--synth-chassis);
    border: 3px solid #fff;
    border-radius: 0;
    box-shadow: none;
  }

  .synth[data-look="brutalist"] .octave output {
    color: #fff;
  }

  .keys {
    min-width: 0;
  }

  .hint {
    grid-area: hint;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    margin: 0;
    font-size: 11px;
    color: var(--synth-ink-dim);
  }

  kbd {
    display: inline-grid;
    place-items: center;
    min-width: 16px;
    height: 18px;
    padding: 0 3px;
    font: inherit;
    font-size: 10px;
    color: var(--synth-ink);
    background: var(--synth-panel);
    border: 1px solid var(--synth-line);
    border-bottom-width: 2px;
    border-radius: 3px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* ---------------------------------------------------------------------- */
  /* Narrow: one column, the screen above the presets                       */
  /* ---------------------------------------------------------------------- */

  @container (max-width: 760px) {
    .chassis {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: "head" "screen" "programs" "panel" "deck" "hint";
      padding: 14px 12px 12px;
      border-inline-width: 8px;
    }

    /* the keys stay at hand while the panel scrolls past */
    .deck {
      position: sticky;
      bottom: 0;
      z-index: 3;
      box-shadow:
        inset 0 3px 10px rgb(0 0 0 / 0.6),
        0 -8px 18px rgb(0 0 0 / 0.45);
    }

    .programs {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
    }

    .program {
      grid-template-columns: auto 1fr;
      padding: 6px 8px;
      font-size: 11px;
    }

    .program .number {
      display: none;
    }

    .hint {
      display: none;
    }
  }

  @container (max-width: 460px) {
    .programs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .screen {
      grid-template-columns: 1fr;
    }

    .deck {
      grid-template-columns: minmax(0, 1fr);
    }

    .octave {
      flex-direction: row;
    }

    .voice {
      grid-template-columns: minmax(0, 1fr);
    }

    .voice > .tag {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .program,
    .segment,
    .add,
    .mini {
      transition:
        background 80ms,
        color 80ms,
        transform 60ms,
        box-shadow 80ms;
    }
  }
</style>

<!-- ====================================================================== -->
<!-- Examples and tests                                                     -->
<!-- ====================================================================== -->

<!-- the instrument in the terminal theme: an LCD, phosphor displays, a dark panel with wooden cheeks -->
{#snippet terminal(Synthesizer: typeof Self, all: typeof themes)}
  <div style="max-width: 1180px; margin: 0 auto; padding: 24px 16px;">
    <Synthesizer theme={all.terminal} />
  </div>
{/snippet}

<!-- the same instrument in the brutalist theme, loaded with the pluck -->
{#snippet brutalist(Synthesizer: typeof Self, all: typeof themes)}
  <div
    style="max-width: 1180px; margin: 0 auto; padding: 24px 16px; background: #fff4e0;"
  >
    <Synthesizer theme={all.brutalist} program="Pluck" />
  </div>
{/snippet}

<!-- the attack fader reshapes the envelope display: its peak moves right -->
{#snippet theAttackReshapesTheEnvelope(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Pluck"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, fireEvent }) => {
    const attack = (await screen.findByLabelText("Attack")) as HTMLInputElement;
    const curve = () =>
      document
        .querySelector('[data-display="envelope"] .curve')!
        .getAttribute("d")!;
    /** the x of the envelope's peak, the path's second point */
    const peak = () => Number(curve().split(" L")[1].split(" ")[0]);

    const before = { curve: curve(), peak: peak() };
    await fireEvent.input(attack, { target: { value: "0.8" } });

    expect(model.data.envelope.attack).toBeGreaterThan(0.5);
    expect(curve()).not.toBe(before.curve);
    expect(peak()).toBeGreaterThan(before.peak);
    expect(
      screen.getByRole("img", { name: /^Envelope: attack 7\d\d ms/ }),
    ).toBeDefined();
  })}
{/snippet}

<!-- adding an oscillator changes the summed waveform; at three, the button goes -->
{#snippet addingAnOscillatorChangesTheWaveform(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Pluck"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, user }) => {
    const wave = () =>
      document
        .querySelector('[data-display="waveform"] .curve')!
        .getAttribute("d");
    const add = await screen.findByRole("button", { name: "Add oscillator" });
    const before = wave();

    await user.click(add);

    expect(model.data.oscillators).toHaveLength(3);
    expect(model.data.oscillators[2]).toEqual({
      wave: "sawtooth",
      octave: 0,
      detune: 0,
      level: 0.6,
    });
    expect(wave()).not.toBe(before);
    expect(
      screen.getByRole("img", { name: /^Waveform of 3 oscillators/ }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Add oscillator" })).toBeNull();
  })}
{/snippet}

<!-- choosing a wave redraws the waveform -->
{#snippet choosingAWaveRedrawsTheWaveform(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Lead"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, user }) => {
    const wave = () =>
      document
        .querySelector('[data-display="waveform"] .curve')!
        .getAttribute("d");
    const sines = await screen.findAllByRole("radio", { name: "sine" });
    const before = wave();

    await user.click(sines[0]);

    expect(model.data.oscillators[0].wave).toBe("sine");
    expect(wave()).not.toBe(before);
  })}
{/snippet}

<!-- a preset button loads the whole patch into the model; editing it lights "edited" -->
{#snippet presetsLoadIntoTheModel(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  library: typeof presets,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Warm pad"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, user, fireEvent }) => {
    const lead = await screen.findByRole("button", { name: "Lead" });
    expect(lead.getAttribute("aria-pressed")).toBe("false");

    await user.click(lead);

    expect(model.data).toEqual(library.Lead);
    expect(lead.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("img", { name: /^Envelope: attack 10 ms, decay 200 ms/ }),
    ).toBeDefined();
    expect(
      (screen.getByLabelText("Patch name") as HTMLInputElement).value,
    ).toBe("Lead");

    // any edit and it is no longer the preset
    await fireEvent.input(screen.getByLabelText("Sustain"), {
      target: { value: "0.2" },
    });
    expect(model.data.envelope.sustain).toBe(0.2);
    expect(lead.getAttribute("aria-pressed")).toBe("false");
  })}
{/snippet}

<!-- switching the filter fills in the variant's fields; a shared field carries over -->
{#snippet theFilterSwitchFillsInItsFields(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Warm pad"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, user }) => {
    await user.click(await screen.findByRole("radio", { name: "Off" }));
    expect(model.data.filter).toEqual({ type: "off" });
    expect(screen.queryByRole("slider", { name: "Cutoff" })).toBeNull();

    await user.click(screen.getByRole("radio", { name: "High-pass" }));
    expect(model.data.filter).toEqual({
      type: "highpass",
      cutoff: 400,
      resonance: 1,
    });
    const cutoff = screen.getByRole("slider", { name: "Cutoff" });
    expect(cutoff.getAttribute("aria-valuetext")).toBe("400 Hz");

    // the knob turns from the keyboard
    cutoff.focus();
    await user.keyboard("{PageUp}");
    expect(model.data.filter).toMatchObject({ type: "highpass" });
    expect(
      (model.data.filter as { cutoff: number }).cutoff,
    ).toBeGreaterThan(400);

    // low-pass keeps the cutoff it had
    const kept = (model.data.filter as { cutoff: number }).cutoff;
    await user.click(screen.getByRole("radio", { name: "Low-pass" }));
    expect(model.data.filter).toEqual({
      type: "lowpass",
      cutoff: kept,
      resonance: 1,
    });
  })}
{/snippet}

<!-- effects are added, reordered and removed from the pedalboard -->
{#snippet effectsAreAddedReorderedAndRemoved(
  Synthesizer: typeof Self,
  SchemaModel: typeof Model,
  load: typeof preset,
  test: Test,
)}
  {@const model = new SchemaModel("edit", load("Pluck"))}
  <Synthesizer {model} />
  {test(async ({ expect, screen, user }) => {
    await user.click(await screen.findByRole("button", { name: "Add Tremolo" }));
    expect(model.data.effects.map((e) => e.type)).toEqual(["delay", "tremolo"]);
    expect(model.data.effects[1]).toEqual({
      type: "tremolo",
      rate: 5,
      depth: 0.5,
    });

    await user.click(screen.getByRole("button", { name: "Move effect 2 earlier" }));
    expect(model.data.effects.map((e) => e.type)).toEqual(["tremolo", "delay"]);

    await user.click(screen.getByRole("button", { name: "Remove effect 1" }));
    expect(model.data.effects.map((e) => e.type)).toEqual(["delay"]);
  })}
{/snippet}

<!-- the computer keyboard plays the on-screen one, sound or not (jsdom has no Web Audio) -->
{#snippet theComputerKeyboardPlaysTheKeys(Synthesizer: typeof Self, test: Test)}
  <Synthesizer />
  {test(async ({ expect, screen, user }) => {
    const c3 = await screen.findByRole("button", { name: "C3" });
    const e3 = screen.getByRole("button", { name: "E3" });

    await user.keyboard("{a>}{d>}");
    expect(c3.getAttribute("aria-pressed")).toBe("true");
    expect(e3.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("playing").textContent).toBe("C3 E3");
    expect(screen.getByText("No Web Audio")).toBeDefined();

    await user.keyboard("{/a}{/d}");
    expect(c3.getAttribute("aria-pressed")).toBe("false");

    // X shifts the keyboard up an octave
    await user.keyboard("x");
    expect(screen.getByRole("button", { name: "C4" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "C3" })).toBeNull();
  })}
{/snippet}
