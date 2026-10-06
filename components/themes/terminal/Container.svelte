<script lang="ts">
  import type { ContainerProps } from "../../registry.js";

  let { model, children }: ContainerProps = $props();
</script>

<!--
  Terminal: a monospace command line. Near-black screen, phosphor-green
  accent, labels set as prompts, inputs between brackets with a green block
  caret, booleans as [x] / [ ], groups boxed like TUI panels with the title
  in the top border, and actions as bracketed commands that invert on hover.
  It is dark in both colour schemes (it is a terminal).

  Every --schemer-* variable can be set on <Schema> (or any ancestor) to
  override the theme's choice; components read the private --sc-* copies.
  Terminal adds two knobs of its own:
    --schemer-terminal-prompt  the marker set before each field's name, as a
                               CSS string (default "›"; try "$" or ">")
    --schemer-terminal-glow    the text-shadow of accent text (default a faint
                               phosphor halo; set to none for flat text)
-->
<div class="terminal" data-theme="terminal" data-mode={model.mode}>
  {@render children()}
</div>

<style>
  .terminal {
    --sc-font: var(
      --schemer-font,
      ui-monospace,
      "JetBrains Mono",
      "SF Mono",
      Menlo,
      Consolas,
      monospace
    );
    --sc-font-size: var(--schemer-font-size, 13.5px);
    --sc-text: var(--schemer-text, #d4e4d4);
    --sc-muted: var(--schemer-muted, #7b927d);
    --sc-background: var(--schemer-background, #0c0f0c);
    --sc-surface: var(--schemer-surface, #121812);
    --sc-border: var(--schemer-border, #2b3a2c);
    --sc-accent: var(--schemer-accent, #4ade80);
    --sc-accent-contrast: var(--schemer-accent-contrast, #0c0f0c);
    --sc-danger: var(--schemer-danger, #f87171);
    --sc-radius: var(--schemer-radius, 4px);
    --sc-spacing: var(--schemer-spacing, 12px);
    --sc-prompt: var(--schemer-terminal-prompt, "›");
    --sc-glow: var(
      --schemer-terminal-glow,
      0 0 0.4em color-mix(in srgb, var(--sc-accent) 30%, transparent)
    );

    font-family: var(--sc-font);
    font-size: var(--sc-font-size);
    font-variant-ligatures: none;
    line-height: 1.55;
    color: var(--sc-text);
    background: var(--sc-background);
    padding: calc(var(--sc-spacing) * 1.5);
    border: 1px solid var(--sc-border);
    border-radius: var(--sc-radius);
    color-scheme: dark;
    -webkit-font-smoothing: antialiased;
  }

  .terminal :global(::selection) {
    color: var(--sc-accent-contrast);
    background: var(--sc-accent);
  }

  /* Field wraps every node in a div; an opt-out button sits in its corner. */
  .terminal :global(div[data-kind]) {
    position: relative;
  }
</style>
