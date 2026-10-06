<script lang="ts">
  import type { Mat } from "./linear.ts";
  import { format } from "./plot.ts";

  /** A 2×2 matrix set as a textbook would: entries in a grid between square brackets. */
  let {
    matrix,
    label,
    size = "md",
    columns = false,
  }: {
    matrix: Mat;
    /** what it is, for a screen reader: "the composed matrix" */
    label: string;
    size?: "sm" | "md" | "lg";
    /** underline each column in its basis vector's colour (î's image, ĵ's image) */
    columns?: boolean;
  } = $props();

  const names = [
    ["a", "b"],
    ["c", "d"],
  ] as const;

  const spoken = $derived(
    `${label}: top row ${format(matrix[0][0])}, ${format(matrix[0][1])}; bottom row ${format(matrix[1][0])}, ${format(matrix[1][1])}`,
  );
</script>

<span class="bracket {size}" class:columns role="img" aria-label={spoken}>
  {#each matrix as row, r}
    {#each row as value, c}
      <span
        class="entry"
        class:i={c === 0}
        class:j={c === 1}
        data-entry={names[r][c]}
        aria-hidden="true"
      >
        {format(value)}
      </span>
    {/each}
  {/each}
</span>

<style>
  .bracket {
    --tick: 0.32em;
    position: relative;
    display: inline-grid;
    grid-template-columns: auto auto;
    column-gap: 0.9em;
    row-gap: 0.1em;
    padding: 0.2em 0.55em;
    font-family: "STIX Two Math", "Cambria Math", "Latin Modern Math", Georgia,
      serif;
    font-variant-numeric: tabular-nums lining-nums;
    line-height: 1.25;
    vertical-align: middle;
  }

  /* the brackets: a rule down each side with a tick at each end */
  .bracket::before,
  .bracket::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: var(--tick);
    border: 1.5px solid currentColor;
  }

  .bracket::before {
    left: 0;
    border-right: 0;
  }

  .bracket::after {
    right: 0;
    border-left: 0;
  }

  .entry {
    min-width: 1.6em;
    text-align: right;
  }

  .sm {
    font-size: 0.9em;
    column-gap: 0.6em;
    padding: 0.1em 0.4em;
  }

  .md {
    font-size: 1.05em;
  }

  .lg {
    font-size: 1.45em;
    column-gap: 1em;
    padding: 0.25em 0.6em;
  }

  /* each column is where a basis vector lands */
  .columns .entry {
    padding-bottom: 0.08em;
  }

  .columns .entry:nth-last-child(-n + 2) {
    box-shadow: inset 0 -2px 0 var(--col);
  }

  .columns .i {
    --col: var(--i-hat, #eb6834);
  }

  .columns .j {
    --col: var(--j-hat, #2a78d6);
  }
</style>
