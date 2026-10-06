<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";

  /**
   * Every action button: `data-action` names it, for tests and styles alike.
   * MD3 shapes: pill buttons (filled tonal, outlined) and round icon buttons,
   * each with a state layer on hover, focus and press.
   */
  let {
    node,
    action,
    detail,
    variant = "icon",
    onclick,
    children,
  }: {
    node: RenderNode;
    action: "opt-in" | "opt-out" | "push" | "splice" | "insert";
    detail?: string;
    variant?: "tonal" | "outlined" | "icon" | "icon-tonal";
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
    /* what the state layer is mixed over, and mixed from */
    --fill: transparent;
    --on: var(--sc-accent);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    box-sizing: border-box;
    height: calc(2.5em / 0.875);
    margin: 0;
    padding: 0 1.5em 0 1.15em;
    font: inherit;
    font-size: 0.875em;
    font-weight: 500;
    letter-spacing: 0.00714em;
    line-height: 1;
    white-space: nowrap;
    color: var(--on);
    background: var(--fill);
    border: 0;
    border-radius: 999px;
    cursor: pointer;
  }

  button:hover {
    background: color-mix(in srgb, var(--on) 8%, var(--fill));
  }

  button:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
    background: color-mix(in srgb, var(--on) 10%, var(--fill));
  }

  button:active {
    background: color-mix(in srgb, var(--on) 12%, var(--fill));
  }

  /* filled tonal: "Add item" */
  .tonal {
    --fill: var(--sc-md-tonal);
    --on: var(--sc-text);
    align-self: flex-start;
  }

  .tonal:hover {
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.3),
      0 1px 3px 1px rgb(0 0 0 / 0.15);
  }

  /* outlined: opting an optional field in */
  .outlined {
    align-self: flex-start;
    border: 1px solid var(--sc-border);
  }

  /* round icon buttons: remove, opt out */
  .icon,
  .icon-tonal {
    --on: var(--sc-muted);
    width: 2.5em;
    height: 2.5em;
    padding: 0;
    font-size: 1em;
  }

  .icon:hover {
    --on: var(--sc-danger);
  }

  /* a small tonal disc: insert between items */
  .icon-tonal {
    --fill: var(--sc-md-tonal);
    --on: var(--sc-text);
    width: 1.75em;
    height: 1.75em;
    font-size: 0.875em;
    box-shadow:
      0 1px 2px rgb(0 0 0 / 0.3),
      0 1px 3px 1px rgb(0 0 0 / 0.15);
  }

  @media (prefers-reduced-motion: no-preference) {
    button {
      transition:
        background-color 150ms,
        box-shadow 150ms,
        color 150ms;
    }
  }
</style>
