<script lang="ts">
  import { pathOf, waveform, waveformPoints } from "./geometry.ts";
  import type { Oscillator } from "./patch.ts";

  /** The oscillators summed into one waveform, over two cycles of the lowest. */
  let { oscillators }: { oscillators: readonly Oscillator[] } = $props();

  const W = 240;
  const H = 92;
  const PAD = 8;

  const curve = $derived(
    pathOf(
      waveformPoints(
        waveform(oscillators, 192, 2),
        { width: W - 2 * PAD, height: H - 2 * PAD },
        2,
      ).map(([x, y]) => [x + PAD, y + PAD] as const),
    ),
  );

  const description = $derived(
    oscillators.length === 0
      ? "Waveform: silent, no oscillators"
      : `Waveform of ${oscillators.length} oscillator${oscillators.length > 1 ? "s" : ""}: ` +
          oscillators
            .map(
              (o) =>
                `${o.wave}${o.octave ? ` ${o.octave > 0 ? "+" : ""}${o.octave} oct` : ""} at ${Math.round(o.level * 100)}%`,
            )
            .join(", "),
  );
</script>

<svg
  class="display"
  viewBox="0 0 {W} {H}"
  role="img"
  aria-label={description}
  data-display="waveform"
>
  <g class="grid" aria-hidden="true">
    {#each [1, 2, 3] as i}
      <line
        x1={PAD + (i * (W - 2 * PAD)) / 4}
        x2={PAD + (i * (W - 2 * PAD)) / 4}
        y1={PAD}
        y2={H - PAD}
      />
    {/each}
    <line class="axis" x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} />
  </g>
  <path class="curve" d={curve} />
</svg>

<style>
  .display {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }

  .grid line {
    stroke: var(--synth-screen-grid, rgb(141 255 181 / 0.1));
    stroke-dasharray: 2 3;
  }

  .grid .axis {
    stroke: var(--synth-screen-dim, rgb(141 255 181 / 0.35));
    stroke-dasharray: none;
  }

  .curve {
    fill: none;
    stroke: var(--synth-screen-ink, #8dffb5);
    stroke-width: 2;
    stroke-linejoin: round;
    filter: drop-shadow(
      0 0 3px var(--synth-screen-glow, rgb(141 255 181 / 0.6))
    );
  }
</style>
