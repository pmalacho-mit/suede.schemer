<script lang="ts" generics="T extends string">
  import type { Snippet } from "svelte";

  /**
   * A short list of choices as one row of segments: radio buttons underneath,
   * so arrow keys move between them and a screen reader hears a group.
   */
  let {
    name,
    legend,
    description,
    options,
    value,
    onchange,
    icon,
    disabled = false,
  }: {
    /** the radio group's name, unique on the page */
    name: string;
    legend: string;
    description?: string;
    options: readonly T[];
    value: T | undefined;
    onchange: (value: T) => void;
    /** drawn before each option's text */
    icon?: Snippet<[T]>;
    disabled?: boolean;
  } = $props();
</script>

<fieldset class="segmented" {disabled}>
  <legend>{legend}</legend>
  <div class="track" style:--columns={options.length === 4 ? 2 : options.length}>
    {#each options as option (option)}
      <label class="segment" class:checked={option === value}>
        <input
          type="radio"
          {name}
          value={option}
          checked={option === value}
          onchange={() => onchange(option)}
        />
        {#if icon}{@render icon(option)}{/if}
        <span>{option}</span>
      </label>
    {/each}
  </div>
  {#if description}<small>{description}</small>{/if}
</fieldset>

<style>
  .segmented {
    display: flex;
    flex-direction: column;
    gap: calc(var(--sc-spacing, 12px) / 2);
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: calc(var(--sc-spacing, 12px) / 2);
    font-weight: 500;
    font-size: 0.93em;
  }

  .track {
    display: grid;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    gap: 2px;
    padding: 3px;
    border-radius: var(--sc-radius, 8px);
    background: color-mix(in srgb, var(--sc-border, #e5e5e5) 55%, transparent);
  }

  .segment {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    min-height: 2.1em;
    padding: 0 0.75em;
    border-radius: calc(var(--sc-radius, 8px) * 0.75);
    font-size: 0.9em;
    color: var(--sc-muted, #737373);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background 120ms,
      color 120ms,
      box-shadow 120ms;
  }

  .segment:hover {
    color: var(--sc-text, inherit);
  }

  .segment.checked {
    color: var(--sc-text, inherit);
    background: var(--sc-background, #fff);
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.08),
      0 0 0 1px color-mix(in srgb, var(--sc-border, #e5e5e5) 80%, transparent);
    font-weight: 500;
  }

  /* the radio stays in the page for the keyboard, drawn by its label */
  input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .segment:has(input:focus-visible) {
    outline: 2px solid var(--sc-accent, currentColor);
    outline-offset: 1px;
  }

  small {
    color: var(--sc-muted, #737373);
    font-size: 0.86em;
  }

  @media (prefers-reduced-motion: reduce) {
    .segment {
      transition: none;
    }
  }
</style>
