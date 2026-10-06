<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";

  /**
   * Every action button: understated text, as a printed form would set an
   * instruction, turning to the accent on hover. `data-action` names it, for
   * tests and styles alike.
   */
  let {
    node,
    action,
    detail,
    variant = "italic",
    onclick,
    children,
  }: {
    node: RenderNode;
    action: "opt-in" | "opt-out" | "push" | "splice" | "insert";
    detail?: string;
    /** italic for instructions, caps to match the labels */
    variant?: "italic" | "caps";
    onclick: () => void;
    children: Snippet;
  } = $props();
</script>

<button
  type="button"
  class={variant}
  data-action={action}
  title={`${action} ${node.title ?? node.path}` + (detail ? ` ${detail}` : "")}
  {onclick}
>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: baseline;
    gap: 0.3em;
    min-height: 1.9em;
    margin: 0;
    padding: 0.2em 0.15em;
    font: inherit;
    line-height: 1.3;
    color: var(--sc-muted);
    background: transparent;
    border: 0;
    border-radius: var(--sc-radius);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.22em;
    cursor: pointer;
  }

  .italic {
    font-style: italic;
  }

  .caps {
    font-variant-caps: all-small-caps;
    letter-spacing: 0.065em;
    font-size: 1.14em;
  }

  button:hover {
    color: var(--sc-accent);
    text-decoration-color: currentColor;
  }

  button:focus-visible {
    outline: 1.5px solid var(--sc-accent);
    outline-offset: 1px;
    color: var(--sc-accent);
  }

  @media (prefers-reduced-motion: no-preference) {
    button {
      transition:
        color 120ms ease,
        text-decoration-color 120ms ease;
    }
  }
</style>
