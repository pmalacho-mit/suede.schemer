<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";

  /** Every action button: `data-action` names it, for tests and styles alike. */
  let {
    node,
    action,
    detail,
    variant = "plain",
    onclick,
    children,
  }: {
    node: RenderNode;
    action: "opt-in" | "opt-out" | "push" | "splice" | "insert";
    detail?: string;
    /** primary: the pink slab; plain: a white one; remove: a square ✕; mini: a small square */
    variant?: "primary" | "plain" | "remove" | "mini";
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
  /* a slab that presses into the page: its shadow is the gap it travels */
  button {
    --press: var(--sc-shadow);
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 0.45em;
    box-sizing: border-box;
    height: 2.6em;
    margin: 0;
    padding: 0 1.1em;
    font: inherit;
    font-size: 0.82em;
    font-weight: 800;
    letter-spacing: 0.1em;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--sc-accent-contrast);
    background: var(--sc-surface);
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: var(--press) var(--press) 0 var(--sc-border);
    cursor: pointer;
  }

  .plain {
    color: var(--sc-text);
  }

  .primary {
    background: var(--sc-highlight);
  }

  .remove,
  .mini {
    width: 2.6em;
    padding: 0;
    font-size: 0.9em;
    color: var(--sc-text);
  }

  /* as tall as the inputs it sits beside */
  .remove {
    width: 2.75em;
    height: 2.75em;
    font-size: 1em;
  }

  .mini {
    --press: calc(var(--sc-shadow) * 0.5);
    width: 1.9em;
    height: 1.9em;
    font-size: 0.85em;
    border-width: calc(var(--sc-stroke) * 0.8);
    background: var(--sc-accent);
    color: var(--sc-accent-contrast);
  }

  button:hover {
    background: var(--sc-accent);
    color: var(--sc-accent-contrast);
  }

  .primary:hover {
    background: color-mix(in srgb, var(--sc-highlight) 80%, var(--sc-surface));
  }

  .remove:hover {
    background: var(--sc-danger);
    color: #111111;
  }

  button:active {
    box-shadow: 0 0 0 var(--sc-border);
  }

  button:focus-visible {
    outline: var(--sc-stroke) solid var(--sc-border);
    outline-offset: 3px;
  }

  /* the press itself is motion: only when motion is welcome */
  @media (prefers-reduced-motion: no-preference) {
    button {
      transition:
        transform 70ms ease-out,
        box-shadow 70ms ease-out,
        background-color 90ms;
    }

    button:hover {
      transform: translate(-1px, -1px);
      box-shadow: calc(var(--press) + 1px) calc(var(--press) + 1px) 0
        var(--sc-border);
    }

    button:active {
      transform: translate(var(--press), var(--press));
      box-shadow: 0 0 0 var(--sc-border);
    }
  }
</style>
