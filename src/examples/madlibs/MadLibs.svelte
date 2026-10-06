<script lang="ts" module>
  import { root } from "../../../release/index.ts";
  import { schemaFor } from "./tales.ts";
  import { stories } from "./stories.ts";

  /** The form: a `oneOf` of the stories, generated from their templates. */
  export const schema = schemaFor(stories);
  const tree = root(schema);
</script>

<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import {
    Model,
    Schema,
    defaults,
    themes,
    type Theme,
  } from "../../../release/index.ts";
  import {
    clip,
    fill,
    missing,
    recital,
    surprise,
    taleOf,
    type Answers,
  } from "./tales.ts";
  import { kinds, type Family } from "./words.ts";
  import StoryPage from "./StoryPage.svelte";
  import StoryPicker from "./StoryPicker.svelte";

  import type Self from "./MadLibs.svelte";
  import type {
    Test,
    Sweater,
  } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import type { dragon, horoscope } from "./fixtures.ts";
  import type { prose } from "./MadLibs.harness.ts";

  type Props = {
    /** the form's theme (paper suits a story) */
    theme?: Theme;
    /** the words to start with, and which story */
    initial?: Answers;
    /** start with the story open */
    revealed?: boolean;
    /** milliseconds between beats when it reads itself aloud */
    tick?: number;
    /** where "Surprise me" starts its luck */
    seed?: number;
  };

  let {
    theme = themes.paper,
    initial,
    revealed: startOpen = false,
    tick = 24,
    seed = Date.now(),
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  const model = new Model<"edit", Answers>(
    "edit",
    initial ?? { story: stories[0].id },
  );
  /**
   * The model as <Schema> types its renderers: by the one path every story
   * shares. (Each story's blanks are its own, so they get kind renderers.)
   */
  const form: Model<"edit", { story: string }> = model;

  const tale = $derived(taleOf(model.data.story));
  const left = $derived(missing(tale, model.data));
  const filled = $derived(tale.blanks.length - left.length);
  /** each blank's number, in the order the story asks for it */
  const numbers = $derived(
    Object.fromEntries(tale.blanks.map(({ key }, i) => [key, i + 1])),
  );

  // svelte-ignore state_referenced_locally
  let revealed = $state(startOpen);
  let peeking = $state(false);

  // ---- reading it aloud: the words stream into a model of their own ----

  let reading = $state<{
    aloud: Model<"stream", Answers>;
    shown: number;
  } | null>(null);
  let timer: ReturnType<typeof setInterval> | undefined;

  const reducedMotion = () =>
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    clearInterval(timer);
    reading = null;
    revealed = true;
  };

  const readAloud = () => {
    clearInterval(timer);
    if (reducedMotion()) return finish();
    const answers = $state.snapshot(model.data) as Answers;
    const beats = recital(tale, answers, 2);
    let beat = 0;
    reading = {
      aloud: new Model<"stream", Answers>("stream", { story: answers.story }),
      shown: 0,
    };
    timer = setInterval(() => {
      if (!reading || beat >= beats.length) return finish();
      const { said, shown } = beats[beat++];
      reading.aloud.applyPartial(said);
      reading.shown = shown;
    }, tick);
  };

  onDestroy(() => clearInterval(timer));

  const paragraphs = $derived(
    reading
      ? clip(fill(tale, reading.aloud.data as Partial<Answers>), reading.shown)
      : fill(tale, model.data),
  );
  const mode = $derived(
    reading ? "reading" : revealed || peeking ? "open" : "folded",
  );

  // ---- driving the form from outside it ----

  let surprises = 0;
  // svelte-ignore state_referenced_locally
  const luck = seed;
  /** a word for every blank, written straight into the model */
  const surpriseMe = () =>
    model.applyPartial(surprise(tale, luck + surprises++));
  /** this story, with no words */
  const clear = () => model.set({ path: "" }, { story: tale.id });

  const hold = (on: boolean) => () => (peeking = on);
  const holdKey = (on: boolean) => (event: KeyboardEvent) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    peeking = on;
  };

  // ---- renderers: the theme's own fields, each badged with its blank ----

  const Themed = $derived({
    string: theme?.byKind?.string ?? defaults.component.byKind.string,
    number: theme?.byKind?.number ?? defaults.component.byKind.number,
    object: theme?.byKind?.object ?? defaults.component.byKind.object,
  });

  /** the part of speech as the input's placeholder: a label, not an example value, so not the schema's `examples` */
  const placeholder = (text: string) => (element: HTMLElement) => {
    for (const input of element.querySelectorAll("input"))
      input.placeholder = text;
  };

  const families: [Family, string][] = [
    ["noun", "nouns"],
    ["verb", "verbs"],
    ["describer", "describing words"],
    ["number", "numbers"],
    ["wildcard", "wild cards"],
  ];
</script>

{#snippet asBlank(key: string, field: Snippet)}
  {@const blank = tale.blanks.find((b) => b.key === key)}
  {#if blank}
    {@const kind = kinds[blank.kind]}
    <div
      class="blank"
      data-family={kind.family}
      {@attach placeholder(kind.short)}
    >
      <span class="number" aria-hidden="true">{numbers[key]}</span>
      <div class="field">{@render field()}</div>
    </div>
  {:else}
    {@render field()}
  {/if}
{/snippet}

<div class="madlibs">
  <header class="masthead">
    <h1>Plot Holes</h1>
    <p>
      Four very short stories, each missing a few words. Pick one, fill in the
      blanks without peeking, then read what you wrote.
    </p>
  </header>

  <div class="layout">
    <section class="form" aria-label="The blanks">
      {#await tree then node}
        <Schema
          root={node}
          model={form}
          {theme}
          --schemer-paper-label-width="10.5em"
        >
          {#snippet oneOf(props)}
            <StoryPicker {...props} />
          {/snippet}

          <!-- the chosen story's blanks: the theme's own group, under a row of tools (its blurb is on its card already) -->
          {#snippet object(props)}
            <div class="tools">
              <p>Fill in {tale.blanks.length} blanks, or let luck do it.</p>
              <button type="button" class="primary" onclick={surpriseMe}>
                <span aria-hidden="true">&#9733;</span> Surprise me
              </button>
              <button type="button" onclick={clear} disabled={filled === 0}>
                Clear
              </button>
            </div>
            <Themed.object {...props} node={{ ...props.node, description: undefined }} />
          {/snippet}

          <!-- the discriminator: the cards already say which story it is -->
          {#snippet story()}{/snippet}

          {#snippet string(props)}
            {#snippet field()}<Themed.string {...props} />{/snippet}
            {@render asBlank(props.node.path, field)}
          {/snippet}

          {#snippet number(props)}
            {#snippet field()}<Themed.number {...props} />{/snippet}
            {@render asBlank(props.node.path, field)}
          {/snippet}
        </Schema>
      {/await}
    </section>

    <section class="reader" aria-label="The story">
      <div class="status">
        <div
          class="meter"
          role="progressbar"
          aria-label="Words filled in"
          aria-valuemin={0}
          aria-valuemax={tale.blanks.length}
          aria-valuenow={filled}
          aria-valuetext="{filled} of {tale.blanks.length}"
        >
          <span style:width="{(filled / tale.blanks.length) * 100}%"></span>
        </div>
        <p aria-live="polite">
          {#if left.length === 0}
            All {tale.blanks.length} words in. Ready when you are.
          {:else}
            {filled} of {tale.blanks.length} words
          {/if}
        </p>
      </div>

      <div class="actions">
        {#if reading}
          <button type="button" class="primary" onclick={finish}>
            Skip to the end
          </button>
        {:else}
          <button
            type="button"
            class="primary"
            aria-pressed={revealed}
            onclick={() => (revealed = !revealed)}
          >
            {revealed ? "Fold it away" : "Reveal the story"}
          </button>
          {#if !revealed}
            <button
              type="button"
              aria-pressed={peeking}
              title="Hold to peek"
              onpointerdown={hold(true)}
              onpointerup={hold(false)}
              onpointerleave={hold(false)}
              onpointercancel={hold(false)}
              onblur={hold(false)}
              onkeydown={holdKey(true)}
              onkeyup={holdKey(false)}
            >
              Peek <small>(hold)</small>
            </button>
          {/if}
          <button type="button" onclick={readAloud}>Read it aloud</button>
        {/if}
      </div>

      <StoryPage
        title={tale.title}
        {paragraphs}
        {mode}
        {numbers}
        complete={left.length === 0}
      />

      <ul class="legend" aria-label="Colours">
        {#each families as [family, label]}
          <li data-family={family}>{label}</li>
        {/each}
      </ul>
    </section>
  </div>
</div>

<!-- the paper theme: a story filled in and read -->
{#snippet paper(MadLibs: typeof Self, answers: typeof dragon)}
  <MadLibs initial={answers} revealed seed={7} />
{/snippet}

<!-- the same app in the terminal theme, half done and still folded -->
{#snippet terminal(
  MadLibs: typeof Self,
  answers: typeof horoscope,
  all: typeof themes,
)}
  <MadLibs theme={all.terminal} initial={answers} seed={7} />
{/snippet}

<!-- picking another story swaps the form's blanks for that story's -->
{#snippet pickingAStoryChangesTheBlanks(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs /></div>
  {test(async ({ expect, user, within, waitFor }) => {
    const view = within(pocket.el);
    await waitFor(() => expect(view.getByLabelText("Celebrity")).toBeTruthy());
    expect(
      pocket.el.querySelector('[data-path="dentist"] input'),
    ).not.toBeNull();
    expect(view.queryByLabelText("Silly noise")).toBeNull();

    await user.click(view.getByRole("radio", { name: /Space Station Log/ }));

    expect(view.getByLabelText("Silly noise")).toBeTruthy();
    expect(pocket.el.querySelector('[data-path="dentist"]')).toBeNull();
    expect(
      pocket.el.querySelector('[data-path="presses"] input'),
    ).not.toBeNull();
    expect(
      view.getByRole("heading", { name: "Space Station Log" }),
    ).toBeTruthy();
  })}
{/snippet}

<!-- each story keeps its words while you try another -->
{#snippet aStoryKeepsItsWordsWhileYouTryAnother(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs /></div>
  {test(async ({ expect, user, within, waitFor }) => {
    const view = within(pocket.el);
    await waitFor(() => expect(view.getByLabelText("Noun")).toBeTruthy());
    await user.type(view.getByLabelText("Noun"), "kazoo");
    await user.click(view.getByRole("radio", { name: /Your Horoscope/ }));
    expect((view.getByLabelText("Noun") as HTMLInputElement).value).toBe("");
    await user.click(view.getByRole("radio", { name: /The Dragon's Dentist/ }));
    expect((view.getByLabelText("Noun") as HTMLInputElement).value).toBe(
      "kazoo",
    );
  })}
{/snippet}

<!-- a word typed into a blank appears, highlighted, in the revealed story -->
{#snippet fillingABlankShowsItInTheRevealedStory(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  read: typeof prose,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs /></div>
  {test(async ({ expect, user, within, waitFor }) => {
    const view = within(pocket.el);
    await waitFor(() => expect(view.getByLabelText("Adjective")).toBeTruthy());
    const article = view.getByRole("article");
    // folded: the story keeps its secrets
    expect(article.querySelector("mark")).toBeNull();

    await user.type(view.getByLabelText("Adjective"), "wobbly");
    await user.click(view.getByRole("button", { name: "Reveal the story" }));

    const word = article.querySelector('mark[data-key="adjective"]');
    expect(word?.firstChild?.textContent).toBe("wobbly");
    expect(word?.querySelector('[role="tooltip"]')?.textContent).toContain(
      "adjective",
    );
    expect(read(article)).toContain("a wobbly old beast called Gerald");
    // the blanks still empty print as their kind
    expect(read(article)).toContain("Dr. ____ (celebrity) had polished");
  })}
{/snippet}

<!-- "Surprise me" writes a word into every blank, through the model -->
{#snippet surpriseMeFillsEveryBlank(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs revealed seed={3} /></div>
  {test(async ({ expect, user, within, waitFor }) => {
    const view = within(pocket.el);
    await waitFor(() => expect(view.getByLabelText("Celebrity")).toBeTruthy());
    await user.click(view.getByRole("radio", { name: /Grandma's Casserole/ }));
    await user.click(view.getByRole("button", { name: /Surprise me/ }));

    const fields = pocket.el.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >(".blank input, .blank select");
    expect(fields.length).toBe(17);
    for (const field of fields) expect(field.value).not.toBe("");
    const article = view.getByRole("article");
    expect(article.textContent).not.toContain("____");
    expect(article.querySelectorAll("mark").length).toBe(18);
    expect(view.getByText(/All 17 words in/)).toBeTruthy();
  })}
{/snippet}

<!-- the story stays folded until revealed; peeking shows it only while held -->
{#snippet peekingShowsTheStoryOnlyWhileHeld(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  answers: typeof dragon,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs initial={answers} /></div>
  {test(async ({ expect, user, within }) => {
    const view = within(pocket.el);
    const article = view.getByRole("article");
    const peek = view.getByRole("button", { name: /Peek/ });
    expect(article.dataset.mode).toBe("folded");
    expect(article.textContent).not.toContain("walrus");

    await user.pointer({ keys: "[MouseLeft>]", target: peek });
    expect(article.dataset.mode).toBe("open");
    expect(article.textContent).toContain("walrus");

    await user.pointer({ keys: "[/MouseLeft]", target: peek });
    expect(article.dataset.mode).toBe("folded");
  })}
{/snippet}

<!-- reading aloud streams the words in and ends on the whole story -->
{#snippet readingAloudEndsOnTheWholeStory(
  MadLibs: typeof Self,
  Status: typeof Sweater.Status,
  read: typeof prose,
  answers: typeof dragon,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <Status {test} />
  <div bind:this={pocket.el}><MadLibs initial={answers} tick={1} /></div>
  {test(async ({ expect, user, within, waitFor }) => {
    const view = within(pocket.el);
    const article = view.getByRole("article");
    await user.click(view.getByRole("button", { name: "Read it aloud" }));
    expect(article.dataset.mode).toBe("reading");
    expect(view.getByRole("button", { name: "Skip to the end" })).toBeTruthy();
    await waitFor(() => expect(article.dataset.mode).toBe("open"), {
      timeout: 10_000,
    });
    expect(read(article)).toContain("Dr. Dolly Parton has since put up a sign");
    expect(view.getByText("The End")).toBeTruthy();
  })}
{/snippet}

<style>
  .madlibs {
    --desk: #efe6d6;
    --desk-ink: #3a2c1f;
    --desk-muted: #7a6650;
    --button: #fffaf0;
    --button-edge: #cdbb9f;
    --primary: #9a3412;
    --primary-ink: #fffaf2;
    --noun: #2f6db5;
    --verb: #2e8540;
    --describer: #9b3fb5;
    --number: #b4610f;
    --wildcard: #c0392b;

    box-sizing: border-box;
    min-height: 100%;
    padding: clamp(16px, 4vw, 40px);
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia,
      serif;
    color: var(--desk-ink);
    background: radial-gradient(
        ellipse at 20% 0%,
        rgb(255 255 255 / 0.5),
        transparent 55%
      ),
      var(--desk);
  }

  @media (prefers-color-scheme: dark) {
    .madlibs {
      --desk: #1f1a16;
      --desk-ink: #f1e6d4;
      --desk-muted: #b6a48c;
      --button: #2c2520;
      --button-edge: #54473b;
      --primary: #e0763f;
      --primary-ink: #1f1a16;
      background: radial-gradient(
          ellipse at 20% 0%,
          rgb(255 220 180 / 0.06),
          transparent 55%
        ),
        var(--desk);
    }
  }

  .masthead {
    max-width: 1180px;
    margin: 0 auto clamp(16px, 3vw, 28px);
  }

  h1 {
    margin: 0;
    font-size: clamp(2.1rem, 6vw, 3.1rem);
    font-weight: 400;
    font-style: italic;
    letter-spacing: -0.01em;
    line-height: 1;
  }

  h1::after {
    content: "_____";
    margin-left: 0.15em;
    font-style: normal;
    letter-spacing: -0.05em;
    color: var(--primary);
  }

  .masthead p {
    max-width: 36em;
    margin: 0.5rem 0 0;
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--desk-muted);
  }

  .layout {
    display: grid;
    gap: clamp(20px, 3vw, 36px);
    max-width: 1180px;
    margin: 0 auto;
  }

  @media (min-width: 980px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
      align-items: start;
    }

    .reader {
      position: sticky;
      top: 16px;
    }
  }

  .form,
  .reader {
    min-width: 0;
  }

  /* each blank: its number in the gutter, in its family's colour */
  .blank {
    display: grid;
    grid-template-columns: 1.6rem minmax(0, 1fr);
    column-gap: 0.55rem;
    align-items: start;
  }

  [data-family="noun"] {
    --family: var(--noun);
  }
  [data-family="verb"] {
    --family: var(--verb);
  }
  [data-family="describer"] {
    --family: var(--describer);
  }
  [data-family="number"] {
    --family: var(--number);
  }
  [data-family="wildcard"] {
    --family: var(--wildcard);
  }

  .number {
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    margin-top: 0.2em;
    font-size: 0.8rem;
    font-weight: 700;
    font-variant-numeric: lining-nums tabular-nums;
    color: #fff;
    background: var(--family);
    border-radius: 50%;
  }

  .field {
    min-width: 0;
  }

  /* the discriminator draws nothing, so its row takes no room */
  .form :global([data-path="story"]) {
    display: none;
  }

  .tools,
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tools {
    align-items: center;
    margin: 0 0 1.25rem;
  }

  /* inside the form: the theme's palette, whatever the desk's */
  .tools button {
    color: var(--sc-text, var(--desk-ink));
    background: var(--sc-surface, var(--button));
    border-color: var(--sc-border, var(--button-edge));
  }

  .tools button.primary {
    color: var(--sc-accent-contrast, var(--primary-ink));
    background: var(--sc-accent, var(--primary));
    border-color: var(--sc-accent, var(--primary));
  }

  .tools button:hover:enabled {
    border-color: var(--sc-accent, var(--primary));
  }

  .tools p {
    flex: 1 1 12em;
    margin: 0;
    font-style: italic;
    color: var(--sc-muted, var(--desk-muted));
  }

  button {
    min-height: 2.5rem;
    padding: 0.45rem 1rem;
    font: inherit;
    font-size: 1rem;
    color: var(--desk-ink);
    background: var(--button);
    border: 1px solid var(--button-edge);
    border-radius: 999px;
    box-shadow: 0 1px 0 rgb(0 0 0 / 0.06);
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
  }

  button:hover:enabled {
    border-color: var(--primary);
  }

  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  button[aria-pressed="true"]:not(.primary) {
    color: var(--primary-ink);
    background: var(--desk-ink);
  }

  button.primary {
    font-weight: 600;
    color: var(--primary-ink);
    background: var(--primary);
    border-color: var(--primary);
  }

  button.primary:hover:enabled {
    background: color-mix(in srgb, var(--primary) 88%, black);
  }

  button small {
    font-size: 0.8em;
    opacity: 0.7;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .status p {
    margin: 0;
    font-size: 0.95rem;
    font-style: italic;
    color: var(--desk-muted);
    text-align: right;
  }

  .meter {
    flex: 1 0 4rem;
    height: 6px;
    overflow: hidden;
    background: color-mix(in srgb, var(--desk-ink) 12%, transparent);
    border-radius: 999px;
  }

  .meter span {
    display: block;
    height: 100%;
    background: var(--primary);
    border-radius: inherit;
  }

  .actions {
    margin-bottom: 1.1rem;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    margin: 1.2rem 0 0;
    padding: 0;
    font-size: 0.88rem;
    color: var(--desk-muted);
    list-style: none;
  }

  .legend li::before {
    content: "";
    display: inline-block;
    width: 0.65em;
    height: 0.65em;
    margin-right: 0.4em;
    background: var(--family);
    border-radius: 50%;
  }

  @media (prefers-reduced-motion: no-preference) {
    .meter span {
      transition: width 300ms ease;
    }

    button {
      transition:
        background-color 140ms ease,
        border-color 140ms ease;
    }
  }
</style>
