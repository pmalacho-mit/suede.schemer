<script lang="ts">
  import { controls } from "../../../release/index.ts";
  import type { Field } from "../../../release/components/Field.svelte";

  /**
   * The story's `oneOf`, drawn as a row of cards rather than a dropdown. It
   * picks a variant with the library's own `controls.variants` (the same
   * behaviour every theme's selector has), then draws the chosen story's
   * blanks with `renderChild`. Each story keeps its own words: switching
   * away and back again finds them where you left them.
   */
  let { node, model, renderChild }: Field.Props<"oneOf"> = $props();

  const id = $props.id();
  const selected = $derived(controls.variants.selected(node, model));

  /** each story's words, kept while you try another */
  const drafts = new Map<number, Record<string, unknown>>();

  const pick = (index: number) => {
    if (index === selected) return;
    const current = model.get(node);
    if (selected >= 0 && current && typeof current === "object")
      drafts.set(selected, $state.snapshot(current) as Record<string, unknown>);
    controls.variants.select(node, model, index);
    const draft = drafts.get(index);
    if (draft) model.applyPartial(draft);
  };

  /** the blanks a variant asks for: every field but its `story` const */
  const blanks = (variant: (typeof node.variants)[number]) =>
    variant.kind === "object"
      ? variant.children.filter((child) => !controls.is.const(child)).length
      : 0;
</script>

<fieldset class="picker" data-role="variant-selector">
  <legend>{node.title ?? "Pick a story"}</legend>
  <div class="cards">
    {#each node.variants as variant, i}
      <label class="card" class:chosen={i === selected}>
        <input
          type="radio"
          name={id}
          value={i}
          checked={i === selected}
          disabled={!model.editable}
          onchange={() => pick(i)}
        />
        <span class="title">{controls.variants.label(variant, i)}</span>
        {#if variant.description}
          <span class="blurb">{variant.description}</span>
        {/if}
        <span class="count">{blanks(variant)} blanks</span>
      </label>
    {/each}
  </div>
</fieldset>

{#if selected >= 0}
  {@render renderChild(node.variants[selected], "oneOf")}
{/if}

<style>
  /* the theme's palette: its container's resolved colours, else the public variables, else paper's */
  .picker {
    --accent: var(--sc-accent, var(--schemer-accent, #9a3412));
    --surface: var(--sc-surface, var(--schemer-surface, #fffdf8));
    --border: var(--sc-border, var(--schemer-border, #ddd3c2));
    --muted: var(--sc-muted, var(--schemer-muted, #7c6f62));
    --radius: var(--sc-radius, var(--schemer-radius, 6px));

    min-width: 0;
    margin: 0 0 1.4rem;
    padding: 0;
    border: 0;
  }

  legend {
    margin-bottom: 0.6rem;
    padding: 0;
    font-size: 0.85rem;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.08em;
    font-size: 1.05rem;
    color: var(--muted);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 8.25rem), 1fr));
    gap: 0.6rem;
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
    padding: 0.7rem 0.8rem 0.65rem;
    line-height: 1.3;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .card:hover {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
  }

  .card.chosen {
    border-color: var(--accent);
    box-shadow: inset 0 0 0 1px var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
  }

  /* the radio itself is read by assistive tech and the keyboard; the card is what shows */
  input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .card:has(input:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .title {
    font-size: 1.02rem;
    font-weight: 600;
  }

  .blurb {
    font-size: 0.85rem;
    font-style: italic;
    color: var(--muted);
  }

  .count {
    margin-top: auto;
    padding-top: 0.25rem;
    font-size: 0.78rem;
    font-variant-caps: all-small-caps;
    letter-spacing: 0.06em;
    font-size: 0.9rem;
    color: var(--accent);
  }

  .chosen .count::before {
    content: "\2713\00a0";
  }

  @media (prefers-reduced-motion: no-preference) {
    .card {
      transition:
        border-color 140ms ease,
        background-color 140ms ease,
        box-shadow 140ms ease;
    }
  }
</style>
