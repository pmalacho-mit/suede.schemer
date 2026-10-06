<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";

  /**
   * Every action button, drawn as a bracketed command: `[ + add ]`, `[ rm ]`.
   * `data-action` names it, for tests and styles alike.
   */
  let {
    node,
    action,
    detail,
    variant = "command",
    onclick,
    children,
  }: {
    node: RenderNode;
    action: "opt-in" | "opt-out" | "push" | "splice" | "insert";
    detail?: string;
    /** command: an accent call to action; quiet: muted until hovered; danger: removes something */
    variant?: "command" | "quiet" | "danger";
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
    align-items: center;
    flex: none;
    gap: 1ch;
    height: 1.9em;
    margin: 0;
    padding: 0 0.5ch;
    font: inherit;
    line-height: 1;
    white-space: nowrap;
    color: var(--sc-muted);
    background: transparent;
    border: 0;
    border-radius: 0;
    cursor: pointer;
  }

  /* the brackets are drawn, and given empty alt text so they are never read out */
  button::before {
    content: "[";
    content: "[" / "";
  }

  button::after {
    content: "]";
    content: "]" / "";
  }

  .command {
    color: var(--sc-accent);
    text-shadow: var(--sc-glow);
  }

  /* hover and focus invert, like a highlighted menu entry */
  button:is(:hover, :focus-visible) {
    color: var(--sc-accent-contrast);
    text-shadow: none;
    background: var(--sc-accent);
    outline: none;
  }

  .danger:is(:hover, :focus-visible) {
    background: var(--sc-danger);
  }

  button:active {
    filter: brightness(0.85);
  }

  @media (prefers-reduced-motion: no-preference) {
    button {
      transition:
        background 80ms,
        color 80ms;
    }
  }
</style>
