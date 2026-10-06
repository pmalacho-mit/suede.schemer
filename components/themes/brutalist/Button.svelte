<script lang="ts">
  import type { Snippet } from "svelte";
  import type { RenderNode } from "../../../types.js";

  /** Every action button: `data-action` names it, for tests and styles alike. */
  let {
    node,
    action,
    detail,
    variant = "ghost",
    onclick,
    children,
  }: {
    node: RenderNode;
    action: "opt-in" | "opt-out" | "push" | "splice" | "insert";
    detail?: string;
    variant?: "ghost" | "outline" | "icon" | "danger";
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
    justify-content: center;
    gap: 0.35em;
    height: 2.15em;
    padding: 0 0.8em;
    font: inherit;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--sc-text);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--sc-radius);
    cursor: pointer;
    transition:
      background 120ms,
      border-color 120ms,
      color 120ms;
  }

  button:hover {
    background: color-mix(in srgb, var(--sc-border) 55%, transparent);
  }

  button:focus-visible {
    outline: 2px solid var(--sc-accent);
    outline-offset: 2px;
  }

  .outline {
    align-self: flex-start;
    border-color: var(--sc-border);
    border-style: dashed;
    color: var(--sc-muted);
  }

  .outline:hover {
    color: var(--sc-text);
    border-style: solid;
  }

  .icon {
    width: 2.15em;
    padding: 0;
    color: var(--sc-muted);
  }

  .danger:hover,
  .icon:hover {
    color: var(--sc-danger);
    background: color-mix(in srgb, var(--sc-danger) 10%, transparent);
  }
</style>
