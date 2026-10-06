<script lang="ts">
  import type { ContainerProps } from "../../registry.js";

  let { model, children }: ContainerProps = $props();
</script>

<!--
  Material: Material Design 3 in plain CSS. Filled text fields (a tonal surface
  with rounded top corners, the label small inside, an underline that thickens
  into the accent on focus), MD3 switches, outlined and tonal cards, pill
  buttons, and hover/focus state layers mixed from the text colour. The tonal
  palettes follow the system's light or dark mode.

  Every --schemer-* variable can be set on <Schema> (or any ancestor) to
  override the theme's choice; components read the private --sc-* copies.
  How the twelve map onto MD3 roles: surface is the filled field's fill
  (surface-container-highest), border is the outline, background the surface.

  Theme-specific knobs:
    --schemer-material-tonal            filled-tonal buttons, the chosen variant
                                        (secondary-container; mixed from the accent)
    --schemer-material-container        tonal cards: array items, a chosen variant
                                        (surface-container; mixed from surface)
    --schemer-material-outline-variant  outlined cards' border, dividers
                                        (mixed from border)
    --schemer-material-card-radius      cards' corners (default 3 × radius)
-->
<div class="material" data-theme="material" data-mode={model.mode}>
  {@render children()}
</div>

<style>
  .material {
    --sc-font: var(--schemer-font, "Roboto", "Segoe UI", system-ui, sans-serif);
    --sc-font-size: var(--schemer-font-size, 16px);
    --sc-text: var(--schemer-text, #1d1b20);
    --sc-muted: var(--schemer-muted, #49454f);
    --sc-background: var(--schemer-background, #fef7ff);
    --sc-surface: var(--schemer-surface, #e6e0e9);
    --sc-border: var(--schemer-border, #79747e);
    --sc-accent: var(--schemer-accent, #6750a4);
    --sc-accent-contrast: var(--schemer-accent-contrast, #ffffff);
    --sc-danger: var(--schemer-danger, #b3261e);
    --sc-radius: var(--schemer-radius, 4px);
    --sc-spacing: var(--schemer-spacing, 16px);

    --sc-md-tonal: var(
      --schemer-material-tonal,
      color-mix(in srgb, var(--sc-accent) 16%, var(--sc-background))
    );
    --sc-md-container: var(
      --schemer-material-container,
      color-mix(in srgb, var(--sc-surface) 40%, var(--sc-background))
    );
    --sc-md-outline-variant: var(
      --schemer-material-outline-variant,
      color-mix(in srgb, var(--sc-border) 40%, var(--sc-background))
    );
    --sc-md-card-radius: var(
      --schemer-material-card-radius,
      calc(var(--sc-radius) * 3)
    );
    /* how far text sits inside a filled field; values align with it */
    --sc-md-inset: 1em;

    font-family: var(--sc-font);
    font-size: var(--sc-font-size);
    line-height: 1.5;
    letter-spacing: 0.01em;
    color: var(--sc-text);
    background: var(--sc-background);
    padding: calc(var(--sc-spacing) * 1.5);
    border-radius: calc(var(--sc-radius) * 4);
    accent-color: var(--sc-accent);
    color-scheme: light;
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-color-scheme: dark) {
    .material {
      --sc-text: var(--schemer-text, #e6e0e9);
      --sc-muted: var(--schemer-muted, #cac4d0);
      --sc-background: var(--schemer-background, #141218);
      --sc-surface: var(--schemer-surface, #36343b);
      --sc-border: var(--schemer-border, #938f99);
      --sc-accent: var(--schemer-accent, #d0bcff);
      --sc-accent-contrast: var(--schemer-accent-contrast, #381e72);
      --sc-danger: var(--schemer-danger, #f2b8b5);
      --sc-md-tonal: var(
        --schemer-material-tonal,
        color-mix(in srgb, var(--sc-accent) 28%, var(--sc-background))
      );
      color-scheme: dark;
    }
  }

  /* a phone: tighter margins, so nested cards keep room for their fields */
  @media (max-width: 480px) {
    .material {
      padding: var(--sc-spacing);
    }
  }

  /* view and stream modes: values read as content, flush with the titles */
  .material:is([data-mode="view"], [data-mode="stream"]) {
    --sc-md-inset: 0;
  }

  /* Field wraps every node in a div; an opt-out button sits in its corner. */
  .material :global(div[data-kind]) {
    position: relative;
  }

  /* a text field with an opt-out button keeps its value clear of it */
  .material :global(div[data-kind]:has(> .md-opt-out) > .md-field > .md-box) {
    padding-right: 3.25em;
  }
</style>
