<script lang="ts">
  import type { Segment } from "./tales.ts";
  import { kinds } from "./words.ts";
  import type Self from "./StoryPage.svelte";
  import type { Test } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import type { fill, taleOf } from "./tales.ts";
  import type { dragon } from "./fixtures.ts";

  /**
   * The story, printed like a page of a storybook. Folded, every word is
   * blacked out (your words as coloured bars, so you can see where they
   * landed); open, your words are highlighted and each says what it was
   * asked for on hover or focus; reading, it types itself out.
   */
  let {
    title,
    paragraphs,
    mode = "open",
    numbers = {},
    complete = false,
  }: {
    title: string;
    paragraphs: Segment[][];
    mode?: "folded" | "open" | "reading";
    /** each blank's number in the form, by key, for the hover tag */
    numbers?: Record<string, number>;
    /** whether every blank has a word: the page ends with "The End" */
    complete?: boolean;
  } = $props();

  const id = $props.id();

  /** what a folded word looks like: the same shape, none of the letters */
  const redact = (text: string) => text.replace(/\S/g, "n");
</script>

<article
  class="page"
  data-mode={mode}
  aria-labelledby="{id}-title"
  aria-busy={mode === "reading"}
>
  <header>
    <p class="kicker" aria-hidden="true">~ a story with holes in it ~</p>
    <h2 id="{id}-title">{title}</h2>
  </header>

  {#if mode === "folded"}
    <p class="sr-only">
      The story is folded away until you reveal it. Its coloured bars are the
      words you have filled in so far.
    </p>
  {/if}

  <div class="text" aria-hidden={mode === "folded"}>
    {#each paragraphs as segments, p}
      <p class:first={p === 0}>
        {#each segments as segment, s}
          {#if !("blank" in segment)}
            {#if mode === "folded"}<span class="bar"
                >{redact(segment.text)}</span
              >{:else}{segment.text}{/if}
          {:else if mode === "folded"}
            <span
              class="bar word"
              class:empty={!segment.filled}
              data-family={kinds[segment.blank.kind].family}
              >{redact(segment.text)}</span
            >
          {:else if segment.filled}
            <!-- focusable so its part of speech shows on focus as well as hover -->
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <mark
              tabindex="0"
              data-family={kinds[segment.blank.kind].family}
              data-key={segment.blank.key}
              aria-describedby="{id}-{p}-{s}"
              >{segment.text}<span class="tag" role="tooltip" id="{id}-{p}-{s}"
                >{kinds[segment.blank.kind].short}{#if numbers[segment.blank.key]}<b
                    >, no.&nbsp;{numbers[segment.blank.key]}</b
                  >{/if}</span
              ></mark
            >
          {:else}
            <span class="hole" data-key={segment.blank.key}>{segment.text}</span
            >
          {/if}
        {/each}{#if mode === "reading" && p === paragraphs.length - 1}<span
            class="caret"
            aria-hidden="true"
          ></span>{/if}
      </p>
    {/each}
  </div>

  {#if complete && mode === "open"}
    <footer aria-hidden="true">The End</footer>
  {/if}
</article>

<!-- the page, open: your words highlighted, each with its part of speech on hover -->
{#snippet open(
  StoryPage: typeof Self,
  build: typeof fill,
  story: typeof taleOf,
  answers: typeof dragon,
)}
  <div style="max-width: 640px; padding: 24px; background: #efe6d6;">
    <StoryPage
      title={story(answers.story).title}
      paragraphs={build(story(answers.story), answers)}
      numbers={{ dentist: 1, number: 2, adjective: 3 }}
      complete
    />
  </div>
{/snippet}

<!-- folded: the words are bars, coloured where you have filled one in -->
{#snippet folded(
  StoryPage: typeof Self,
  build: typeof fill,
  story: typeof taleOf,
  answers: typeof dragon,
)}
  <div style="max-width: 640px; padding: 24px; background: #efe6d6;">
    <StoryPage
      title={story(answers.story).title}
      paragraphs={build(story(answers.story), {
        story: "dragon",
        dentist: "Dolly Parton",
        adjective: "soggy",
      })}
      mode="folded"
    />
  </div>
{/snippet}

<!-- an empty blank prints as "____ (kind)" -->
{#snippet emptyBlanksPrintTheirKind(
  StoryPage: typeof Self,
  build: typeof fill,
  story: typeof taleOf,
  pocket: { el: HTMLDivElement },
  test: Test,
)}
  <div bind:this={pocket.el}>
    <StoryPage
      title="The Dragon's Dentist"
      paragraphs={build(story("dragon"), {
        story: "dragon",
        adjective: "soggy",
      })}
    />
  </div>
  {test(async ({ expect }) => {
    const text = pocket.el.textContent ?? "";
    expect(text).toContain("Dr. ____ (celebrity) had polished ____ (number)");
    expect(
      pocket.el.querySelector('mark[data-key="adjective"]')?.firstChild
        ?.textContent,
    ).toBe("soggy");
  })}
{/snippet}

<style>
  .page {
    --ink: #2b2118;
    --muted: #85745f;
    --stock: #fffaf0;
    --edge: #e7dcc6;
    --noun: #2f6db5;
    --verb: #2e8540;
    --describer: #9b3fb5;
    --number: #b4610f;
    --wildcard: #c0392b;

    position: relative;
    box-sizing: border-box;
    min-width: 0;
    padding: clamp(22px, 5vw, 44px) clamp(18px, 5vw, 48px)
      clamp(26px, 5vw, 40px);
    font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia,
      serif;
    font-size: 1.075rem;
    line-height: 1.7;
    color: var(--ink);
    background: radial-gradient(
        120% 80% at 50% 0%,
        transparent 60%,
        rgb(150 110 60 / 0.07)
      ),
      var(--stock);
    border-radius: 3px 3px 3px 3px;
    box-shadow:
      0 0 0 1px var(--edge),
      0 1px 2px rgb(60 40 20 / 0.08),
      0 18px 40px -22px rgb(60 40 20 / 0.45),
      /* the page beneath */ 5px 6px 0 -1px var(--stock),
      5px 6px 0 0 var(--edge);
    color-scheme: light;
  }

  header {
    margin-bottom: 1.1em;
    text-align: center;
  }

  .kicker {
    margin: 0;
    font-size: 0.78em;
    font-style: italic;
    letter-spacing: 0.06em;
    color: var(--muted);
  }

  h2 {
    margin: 0.1em 0 0;
    font-size: clamp(1.45em, 4vw, 1.9em);
    font-weight: 400;
    line-height: 1.15;
    text-wrap: balance;
  }

  h2::after {
    content: "";
    display: block;
    width: 4.5em;
    margin: 0.45em auto 0;
    border-top: 3px double color-mix(in srgb, var(--ink) 35%, transparent);
  }

  .text p {
    margin: 0 0 0.85em;
    text-wrap: pretty;
    hyphens: auto;
  }

  .text p + p {
    text-indent: 1.5em;
  }

  /* a drop cap opens the story */
  .text p.first::first-letter {
    float: left;
    margin: 0.07em 0.08em 0 0;
    font-size: 3.35em;
    line-height: 0.85;
    color: #9a3412;
  }

  mark {
    position: relative;
    padding: 0 0.12em;
    margin: 0 -0.04em;
    font-style: italic;
    font-weight: 600;
    color: color-mix(in srgb, var(--family) 82%, black);
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--family) 20%, transparent) 0.62em,
      transparent 0.62em
    );
    border-radius: 2px;
    outline: none;
    cursor: help;
    hyphens: manual;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
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

  mark:focus-visible {
    box-shadow:
      0 0 0 2px var(--stock),
      0 0 0 4px var(--family);
  }

  /* the part of speech, on hover or focus */
  .tag {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 6px);
    z-index: 2;
    display: block;
    padding: 0.2em 0.6em 0.25em;
    font-size: 0.72rem;
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.05em;
    line-height: 1.3;
    white-space: nowrap;
    color: #fffaf0;
    text-transform: lowercase;
    font-variant-caps: all-small-caps;
    font-size: 0.85rem;
    background: color-mix(in srgb, var(--family) 85%, black);
    border-radius: 4px;
    box-shadow: 0 4px 12px -4px rgb(0 0 0 / 0.35);
    transform: translate(-50%, 3px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .tag::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    border: 5px solid transparent;
    border-top-color: color-mix(in srgb, var(--family) 85%, black);
    transform: translateX(-50%);
  }

  .tag b {
    font-weight: 400;
    font-variant-numeric: lining-nums;
    opacity: 0.8;
  }

  mark:hover .tag,
  mark:focus-visible .tag {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, 0);
  }

  .hole {
    font-style: italic;
    color: var(--muted);
    white-space: nowrap;
  }

  /* folded: the shape of the story, none of its words */
  .bar {
    color: transparent;
    background: color-mix(in srgb, var(--ink) 13%, transparent);
    background-clip: content-box;
    border-radius: 2px;
    user-select: none;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  .bar.word {
    background: color-mix(in srgb, var(--family) 55%, transparent);
  }

  .bar.word.empty {
    background: transparent;
    outline: 1.5px dashed color-mix(in srgb, var(--ink) 30%, transparent);
    outline-offset: -2px;
  }

  [data-mode="folded"] .text p.first::first-letter {
    color: transparent;
  }

  .caret {
    display: inline-block;
    width: 0.08em;
    height: 1.05em;
    margin-left: 0.06em;
    vertical-align: -0.15em;
    background: var(--ink);
  }

  footer {
    margin-top: 1.4em;
    font-size: 0.9em;
    font-style: italic;
    letter-spacing: 0.2em;
    text-align: center;
    text-transform: uppercase;
    color: var(--muted);
  }

  footer::before,
  footer::after {
    content: "\2766";
    margin: 0 0.8em;
    letter-spacing: 0;
    color: #9a3412;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: no-preference) {
    .caret {
      animation: blink 1s steps(1) infinite;
    }

    .tag {
      transition:
        opacity 120ms ease,
        transform 120ms ease,
        visibility 120ms;
    }

    .bar {
      transition: background-color 300ms ease;
    }
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
</style>
