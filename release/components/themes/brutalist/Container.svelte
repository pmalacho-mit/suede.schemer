<script lang="ts">
  import type { ContainerProps } from "../../registry.js";

  let { model, children }: ContainerProps = $props();
</script>

<!--
  Brutalist: neo-brutalism. Thick black strokes, hard offset shadows with no
  blur, square corners, a heavy grotesque with uppercase tracked labels, a
  cream page, a loud yellow for focus and checked states and a pink for
  buttons. Buttons press into the page; view mode reads as a printed spec
  sheet. Follows the system's dark mode with an inverted palette.

  Every --schemer-* variable can be set on <Schema> (or any ancestor) to
  override the theme's choice; components read the private --sc-* copies.
  Beyond the twelve shared variables, this theme reads:

  --schemer-brutalist-highlight  the buttons' fill (default #ff90e8, pink)
  --schemer-brutalist-display    the heading font (default "Arial Black" and
                                 heavy system grotesques)
  --schemer-brutalist-stroke     the border width (default 3px)
  --schemer-brutalist-shadow     the hard shadow's offset (default 4px)
-->
<div class="brutalist" data-theme="brutalist" data-mode={model.mode}>
  {@render children()}
</div>

<style>
  .brutalist {
    --sc-font: var(
      --schemer-font,
      "Helvetica Neue",
      Helvetica,
      Arial,
      system-ui,
      sans-serif
    );
    --sc-font-size: var(--schemer-font-size, 15px);
    --sc-text: var(--schemer-text, #111111);
    --sc-muted: var(--schemer-muted, #55524a);
    --sc-background: var(--schemer-background, #fff4e0);
    --sc-surface: var(--schemer-surface, #ffffff);
    --sc-border: var(--schemer-border, #111111);
    --sc-accent: var(--schemer-accent, #ffde59);
    --sc-accent-contrast: var(--schemer-accent-contrast, #111111);
    --sc-danger: var(--schemer-danger, #ff5c5c);
    --sc-radius: var(--schemer-radius, 0px);
    --sc-spacing: var(--schemer-spacing, 12px);

    --sc-highlight: var(--schemer-brutalist-highlight, #ff90e8);
    --sc-display: var(
      --schemer-brutalist-display,
      "Arial Black",
      "Helvetica Neue",
      Helvetica,
      Arial,
      system-ui,
      sans-serif
    );
    --sc-stroke: var(--schemer-brutalist-stroke, 3px);
    --sc-shadow: var(--schemer-brutalist-shadow, 4px);

    box-sizing: border-box;
    margin: 0 calc(var(--sc-shadow) * 2) calc(var(--sc-shadow) * 2) 0;
    padding: calc(var(--sc-spacing) * 2);
    font-family: var(--sc-font);
    font-size: var(--sc-font-size);
    line-height: 1.45;
    color: var(--sc-text);
    background: var(--sc-background);
    border: var(--sc-stroke) solid var(--sc-border);
    border-radius: var(--sc-radius);
    box-shadow: calc(var(--sc-shadow) * 2) calc(var(--sc-shadow) * 2) 0
      var(--sc-border);
    color-scheme: light;
  }

  @media (max-width: 480px) {
    .brutalist {
      padding: var(--sc-spacing);
    }
  }

  @media (prefers-color-scheme: dark) {
    .brutalist {
      --sc-text: var(--schemer-text, #fff4e0);
      --sc-muted: var(--schemer-muted, #bdb6a6);
      --sc-background: var(--schemer-background, #161616);
      --sc-surface: var(--schemer-surface, #232323);
      --sc-border: var(--schemer-border, #fff4e0);
      --sc-accent: var(--schemer-accent, #ffde59);
      --sc-accent-contrast: var(--schemer-accent-contrast, #111111);
      --sc-danger: var(--schemer-danger, #ff6b6b);
      color-scheme: dark;
    }
  }

  /* Field wraps every node in a div; an opt-out button sits in its corner. */
  .brutalist :global(div[data-kind]) {
    position: relative;
  }
</style>
