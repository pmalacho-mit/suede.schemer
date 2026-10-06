<script lang="ts">
  import type { ContainerProps } from "../../registry.js";

  let { model, children }: ContainerProps = $props();
</script>

<!--
  Minimal: neutral greys, hairline borders, one dark accent (shadcn-like).
  Every --schemer-* variable can be set on <Schema> (or any ancestor) to
  override the theme's choice; components read the private --sc-* copies.
-->
<div class="minimal" data-theme="minimal" data-mode={model.mode}>
  {@render children()}
</div>

<style>
  .minimal {
    --sc-font: var(
      --schemer-font,
      ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif
    );
    --sc-font-size: var(--schemer-font-size, 14px);
    --sc-text: var(--schemer-text, #0a0a0a);
    --sc-muted: var(--schemer-muted, #737373);
    --sc-background: var(--schemer-background, #ffffff);
    --sc-surface: var(--schemer-surface, #ffffff);
    --sc-border: var(--schemer-border, #e5e5e5);
    --sc-accent: var(--schemer-accent, #171717);
    --sc-accent-contrast: var(--schemer-accent-contrast, #fafafa);
    --sc-danger: var(--schemer-danger, #dc2626);
    --sc-radius: var(--schemer-radius, 8px);
    --sc-spacing: var(--schemer-spacing, 12px);

    font-family: var(--sc-font);
    font-size: var(--sc-font-size);
    line-height: 1.5;
    color: var(--sc-text);
    background: var(--sc-background);
    padding: calc(var(--sc-spacing) * 1.5);
    border-radius: calc(var(--sc-radius) * 1.5);
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    .minimal {
      --sc-text: var(--schemer-text, #fafafa);
      --sc-muted: var(--schemer-muted, #a3a3a3);
      --sc-background: var(--schemer-background, #0a0a0a);
      --sc-surface: var(--schemer-surface, #0a0a0a);
      --sc-border: var(--schemer-border, #262626);
      --sc-accent: var(--schemer-accent, #fafafa);
      --sc-accent-contrast: var(--schemer-accent-contrast, #171717);
      --sc-danger: var(--schemer-danger, #f87171);
      color-scheme: dark;
    }
  }

  /* Field wraps every node in a div; an opt-out button sits in its corner. */
  .minimal :global(div[data-kind]) {
    position: relative;
  }
</style>
