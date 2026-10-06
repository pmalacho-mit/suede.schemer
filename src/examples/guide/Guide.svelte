<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import Step3Form from "./Step3Form.svelte";
  import Step4Theme from "./Step4Theme.svelte";
  import Step5Kind from "./Step5Kind.svelte";
  import Step6Path from "./Step6Path.svelte";
  import Step7Lists from "./Step7Lists.svelte";
  import Step8Display from "./Step8Display.svelte";
  // each step's code, as the file it is: what the guide shows is what runs
  import data from "./data.ts?raw";
  import schema from "./schema.ts?raw";
  import step3 from "./Step3Form.svelte?raw";
  import step4 from "./Step4Theme.svelte?raw";
  import step5 from "./Step5Kind.svelte?raw";
  import step6 from "./Step6Path.svelte?raw";
  import step7 from "./Step7Lists.svelte?raw";
  import step8 from "./Step8Display.svelte?raw";

  import type Self from "./Guide.svelte";
  import type { Test } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import type Forms from "./Step3Form.svelte";
  import type Sliders from "./Step5Kind.svelte";
  import type WaveButtons from "./Step6Path.svelte";
  import type Lists from "./Step7Lists.svelte";
  import type Display from "./Step8Display.svelte";
</script>

<article class="guide">
  <header>
    <p class="kicker">suede.schemer · guide</p>
    <h1>From an idea of some data to an instrument</h1>
    <p class="lede">
      You know roughly what you want people to edit: here, a patch for a small
      synthesizer. This guide wires it up one step at a time, from a type to a
      schema, a form, a look, controls of your own, and finally a display and
      sound driven by what the form holds. Each step's code is the file that
      runs beside it.
    </p>
  </header>

  {@render step(1, "Write down the data", "data.ts", data, null, one)}
  {@render step(2, "Describe it in JSON Schema", "schema.ts", schema, null, two)}
  {@render step(3, "Draw a form", "Step3Form.svelte", step3, Step3Form, three)}
  {@render step(4, "Give it a look", "Step4Theme.svelte", step4, Step4Theme, four)}
  {@render step(5, "Your own control for a kind of field", "Step5Kind.svelte", step5, Step5Kind, five)}
  {@render step(6, "Your own control for one field", "Step6Path.svelte", step6, Step6Path, six)}
  {@render step(7, "Lists and choices", "Step7Lists.svelte", step7, Step7Lists, seven)}
  {@render step(8, "Drive your own display", "Step8Display.svelte", step8, Step8Display, eight)}

  <section class="next">
    <h2>Where to go next</h2>
    <p>
      The full <a href="#src/examples/synthesizer/Synthesizer/terminal">synthesizer</a>
      is these steps taken further: knobs and faders as kind renderers, a card per
      oscillator, a pedalboard of effects, and a sound engine that follows every edit.
      The <a href="#src/examples/matrix/Matrix/explorerInMinimal">matrix</a> and
      <a href="#src/examples/madlibs/MadLibs/paper">Mad Libs</a> examples do the same for
      other kinds of data.
    </p>
    <table>
      <thead>
        <tr><th>A snippet inside &lt;Schema&gt; named…</th><th>draws</th></tr>
      </thead>
      <tbody>
        <tr><td><code>number</code>, <code>string</code>, <code>oneOf</code>, …</td><td>every field of that kind</td></tr>
        <tr><td><code>envelope__attack</code></td><td>the field at that path</td></tr>
        <tr><td><code>harmonics___item</code>, <code>harmonics___item__level</code></td><td>every item of a list, or that field of every item</td></tr>
        <tr><td><code>push__harmonics</code>, <code>splice__…</code>, <code>insert__…</code></td><td>a list's add, remove and insert buttons</td></tr>
      </tbody>
    </table>
  </section>
</article>

{#snippet step(
  n: number,
  title: string,
  file: string,
  source: string,
  Demo: Component | null,
  prose: Snippet,
)}
  <section class="step" aria-labelledby="step-{n}">
    <h2 id="step-{n}"><span class="n">{n}</span>{title}</h2>
    <div class="prose">{@render prose()}</div>
    <div class="pair" class:solo={!Demo}>
      <figure class="code">
        <figcaption>{file}</figcaption>
        <pre><code>{source.trim()}</code></pre>
      </figure>
      {#if Demo}
        <figure class="demo">
          <figcaption>live</figcaption>
          <div class="stage"><Demo /></div>
        </figure>
      {/if}
    </div>
  </section>
{/snippet}

{#snippet one()}
  <p>
    Start from the data itself, not the form: a TypeScript type for what you want to
    hold, and one value of it to start from. A patch has a name, a wave, an octave and a
    volume; an envelope (a group of two numbers); a list of harmonics; and a filter,
    which is one of three things.
  </p>
{/snippet}

{#snippet two()}
  <p>
    Then say the same in JSON Schema, which is what the form is drawn from. Everything
    a person sees comes from here: <code>title</code> names a field,
    <code>description</code> explains it, <code>enum</code> becomes a choice,
    <code>minimum</code>/<code>maximum</code>/<code>multipleOf</code> bound and step a
    number, <code>default</code> fills a new field, and <code>examples</code> becomes a
    placeholder. A choice between shapes is a <code>oneOf</code>, each told apart by a
    <code>const</code>.
  </p>
{/snippet}

{#snippet three()}
  <p>
    Three lines make a working form: a <code>Model</code> holds the data (in
    <code>"edit"</code>, <code>"view"</code> or <code>"stream"</code> mode),
    <code>root</code> turns the schema into the tree of fields, and
    <code>&lt;Schema&gt;</code> draws it. Lists get add and remove buttons, the filter
    a choice of kind, and every input is typed and bounded by the schema.
  </p>
{/snippet}

{#snippet four()}
  <p>
    Pass a <code>theme</code> (<code>minimal</code>, <code>material</code>,
    <code>paper</code>, <code>terminal</code> or <code>brutalist</code>) and set any of its
    <code>--schemer-*</code> variables on <code>&lt;Schema&gt;</code>. The theme draws
    every field; you have not written a line of CSS.
  </p>
{/snippet}

{#snippet five()}
  <p>
    When a kind of field should look different everywhere, declare a snippet named for
    the kind inside <code>&lt;Schema&gt;</code>. Its parameter needs no type: the name
    says what it draws, so <code>node</code> is a number's node, with its
    <code>min</code>, <code>max</code> and <code>step</code>. <code>model.get</code> reads
    the field and <code>model.on(node, Number)</code> writes it.
  </p>
{/snippet}

{#snippet six()}
  <p>
    When one field should, name the snippet for its path instead. A path renderer wins
    over a kind renderer, which wins over the theme: so the wave is buttons, and every
    other field is as before.
  </p>
{/snippet}

{#snippet seven()}
  <p>
    Lists and choices have names too: <code>harmonics___item</code> draws every
    harmonic (and is told which, by <code>index</code>; a field of each would be
    <code>harmonics___item__level</code>),
    <code>push__harmonics</code> draws the list's add button, and <code>filter</code> draws
    the choice of filter. <code>controls</code> does what the default components do, so
    your own controls behave the same: a new harmonic starts from the schema's defaults,
    and switching from low- to high-pass keeps the cutoff.
  </p>
{/snippet}

{#snippet eight()}
  <p>
    Finally, use what the form holds. <code>model.data</code> is the patch, live: draw
    from it and your drawing follows every edit. Here the envelope's shape redraws as you
    move attack, release and volume, and Play turns the patch into sound.
  </p>
{/snippet}

<style>
  .guide {
    --ink: #1c1917;
    --soft: #57534e;
    --line: #e7e5e4;
    --accent: #7c3aed;
    max-width: 72rem;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
    color: var(--ink);
    font:
      16px/1.6 ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif;
  }

  header {
    max-width: 44rem;
    margin-bottom: 3rem;
  }

  .kicker {
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--soft);
  }

  h1 {
    margin: 0.3rem 0 0.8rem;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    line-height: 1.15;
  }

  .lede {
    margin: 0;
    font-size: 1.1rem;
    color: var(--soft);
  }

  .step {
    padding: 2.5rem 0;
    border-top: 1px solid var(--line);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 0.75rem;
    font-size: 1.35rem;
  }

  .n {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    font-size: 0.95rem;
    color: white;
    background: var(--accent);
    border-radius: 50%;
  }

  .prose {
    max-width: 44rem;
    color: var(--soft);
  }

  .prose :global(code),
  .next code {
    font:
      0.88em ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
    color: var(--ink);
  }

  .pair {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 1.25rem;
    margin-top: 1.25rem;
  }

  .pair.solo {
    grid-template-columns: minmax(0, 44rem);
  }

  @media (max-width: 900px) {
    .pair {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  figure {
    min-width: 0;
    margin: 0;
  }

  figcaption {
    margin-bottom: 0.4rem;
    font:
      600 0.75rem ui-monospace,
      monospace;
    color: var(--soft);
  }

  /* beside a long demo, the code stays in sight */
  .pair:not(.solo) .code {
    position: sticky;
    top: 1rem;
    align-self: start;
  }

  .code pre {
    max-height: calc(100vh - 4rem);
    margin: 0;
    padding: 1rem;
    overflow: auto;
    font:
      12.5px/1.55 ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
    color: #e7e5e4;
    background: #1c1917;
    border-radius: 12px;
  }

  .stage {
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 12px;
  }

  .next {
    padding-top: 2.5rem;
    border-top: 1px solid var(--line);
  }

  .next p {
    max-width: 44rem;
    color: var(--soft);
  }

  .next a {
    color: var(--accent);
  }

  table {
    width: 100%;
    max-width: 44rem;
    border-collapse: collapse;
    font-size: 0.95rem;
  }

  th,
  td {
    padding: 0.5rem 0.75rem 0.5rem 0;
    text-align: left;
    border-bottom: 1px solid var(--line);
  }

  th {
    font-weight: 600;
  }
</style>

<!-- the whole guide, on a page of its own -->
{#snippet walkthrough(Guide: typeof Self)}
  <Guide />
{/snippet}

<!-- what each step says it does, checked -->
{#snippet step3DrawsAFieldPerProperty(Guide: typeof Self, Form: typeof Forms, test: Test)}
  <Form />
  {test(async ({ expect, screen }) => {
    for (const label of ["Name", "Octave", "Volume", "Attack", "Release"])
      expect(await screen.findByLabelText(label)).toBeDefined();
  })}
{/snippet}

{#snippet step5DrawsEveryNumberAsASlider(Guide: typeof Self, Form: typeof Sliders, test: Test)}
  <Form />
  {test(async ({ expect, waitFor }) => {
    await waitFor(() =>
      expect(document.querySelectorAll('input[type="range"]').length).toBeGreaterThan(5),
    );
    expect(document.querySelector('input[type="number"]')).toBeNull();
  })}
{/snippet}

{#snippet step6DrawsTheWaveAsButtons(Guide: typeof Self, Form: typeof WaveButtons, test: Test)}
  <Form />
  {test(async ({ expect, screen, user }) => {
    const square = await screen.findByRole("radio", { name: "square" });
    await user.click(square);
    expect((square as HTMLInputElement).checked).toBe(true);
  })}
{/snippet}

{#snippet step7AddsHarmonicsAndKeepsTheCutoff(Guide: typeof Self, Form: typeof Lists, test: Test)}
  <Form />
  {test(async ({ expect, screen, user }) => {
    await user.click(await screen.findByRole("button", { name: "+ Add a harmonic" }));
    expect(screen.getByText("Harmonic 3")).toBeDefined();
    await user.click(screen.getByRole("radio", { name: "High-pass" }));
    expect((screen.getByLabelText("Cutoff") as HTMLInputElement).value).toBe("4000");
  })}
{/snippet}

{#snippet step8RedrawsTheEnvelope(Guide: typeof Self, Form: typeof Display, test: Test)}
  <Form />
  {test(async ({ expect, screen, user }) => {
    const shape = () => document.querySelector("polyline")!.getAttribute("points");
    const before = shape();
    const attack = (await screen.findByLabelText("Attack")) as HTMLInputElement;
    await user.clear(attack);
    await user.type(attack, "1");
    expect(shape()).not.toBe(before);
  })}
{/snippet}
