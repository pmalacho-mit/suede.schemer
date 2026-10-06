<script lang="ts">
  import type { ContainerProps } from "../../registry.js";

  let { model, children }: ContainerProps = $props();
</script>

<!--
  Paper: a well-typeset printed form. Off-white stock, ink-dark serif text,
  small-caps labels set against ruled lines, hairline rules between sections
  and one terracotta accent. Light only: it is paper, whatever the system's
  colour scheme, but every --schemer-* variable still overrides it.

  Components read the private --sc-* copies. Paper's own knobs:
    --schemer-paper-rule         colour of the ruled lines values sit on
                                 (default: the text colour, faded)
    --schemer-paper-label-width  width of the label column on wide forms
                                 (default 10em; labels stack above their
                                 lines when a field is narrower than 26em)
    --schemer-paper-shadow       the sheet's drop shadow (default a soft
                                 lift; `none` to lay the form flat)
-->
<div class="paper" data-theme="paper" data-mode={model.mode}>
  {@render children()}
</div>

<style>
  .paper {
    --sc-font: var(
      --schemer-font,
      "Iowan Old Style",
      "Palatino Linotype",
      Palatino,
      Georgia,
      serif
    );
    --sc-font-size: var(--schemer-font-size, 16px);
    --sc-text: var(--schemer-text, #2a221c);
    --sc-muted: var(--schemer-muted, #7c6f62);
    --sc-background: var(--schemer-background, #fbf7ef);
    --sc-surface: var(--schemer-surface, #fffdf8);
    --sc-border: var(--schemer-border, #ddd3c2);
    --sc-accent: var(--schemer-accent, #9a3412);
    --sc-accent-contrast: var(--schemer-accent-contrast, #fffaf2);
    --sc-danger: var(--schemer-danger, #b42318);
    --sc-radius: var(--schemer-radius, 2px);
    --sc-spacing: var(--schemer-spacing, 14px);

    --sc-paper-rule: var(
      --schemer-paper-rule,
      color-mix(in srgb, var(--sc-text) 32%, transparent)
    );
    --sc-paper-label-width: var(--schemer-paper-label-width, 10em);

    font-family: var(--sc-font);
    font-size: var(--sc-font-size);
    font-variant-numeric: oldstyle-nums proportional-nums;
    line-height: 1.5;
    color: var(--sc-text);
    background: var(--sc-background);
    padding: calc(var(--sc-spacing) * 2.25) calc(var(--sc-spacing) * 2.5)
      calc(var(--sc-spacing) * 2.5);
    border-radius: var(--sc-radius);
    box-shadow: var(
      --schemer-paper-shadow,
      0 0 0 1px color-mix(in srgb, var(--sc-text) 7%, transparent),
      0 1px 2px color-mix(in srgb, var(--sc-text) 8%, transparent),
      0 12px 32px -18px color-mix(in srgb, var(--sc-text) 35%, transparent)
    );
    color-scheme: light;
  }

  @media (max-width: 480px) {
    .paper {
      padding: calc(var(--sc-spacing) * 1.5) calc(var(--sc-spacing) * 1.15);
    }
  }

  .paper :global(::selection) {
    background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
  }

  /* Field wraps every node in a div; an opt-out button sits in its corner. */
  .paper :global(div[data-kind]) {
    position: relative;
  }
</style>
