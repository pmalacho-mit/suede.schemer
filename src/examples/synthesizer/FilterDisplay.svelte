<script lang="ts">
  import {
    decibelY,
    filterPoints,
    frequencyX,
    pathOf,
  } from "./geometry.ts";
  import { format, params } from "./params.ts";
  import type { Filter } from "./patch.ts";

  /** The filter's frequency response, on a small screen of its own: 20 Hz to 20 kHz, on a log scale. */
  let { filter }: { filter: Filter } = $props();

  const W = 200;
  const H = 64;
  const PAD = 4;
  const box = { width: W - 2 * PAD, height: H - 2 * PAD - 8 };

  const curve = $derived(
    pathOf(filterPoints(filter, box).map(([x, y]) => [x + PAD, y + PAD] as const)),
  );
  const unity = PAD + decibelY(0, box.height);
  const cutoff = $derived(
    filter.type === "off" ? undefined : PAD + frequencyX(filter.cutoff, box.width),
  );
  const marks = [100, 1000, 10000].map((f) => ({
    x: PAD + frequencyX(f, box.width),
    label: f >= 1000 ? `${f / 1000}k` : `${f}`,
  }));
  const description = $derived(
    filter.type === "off"
      ? "Filter response: flat, the filter is off"
      : `Filter response: ${filter.type === "lowpass" ? "low-pass" : "high-pass"} at ` +
          `${format(filter.cutoff, params.cutoff)}, resonance ${format(filter.resonance, params.resonance)}`,
  );
</script>

<svg
  class="display"
  viewBox="0 0 {W} {H}"
  role="img"
  aria-label={description}
  data-display="filter"
>
  <g class="grid" aria-hidden="true">
    {#each marks as { x, label }}
      <line x1={x} x2={x} y1={PAD} y2={PAD + box.height} />
      <text {x} y={H - 2}>{label}</text>
    {/each}
    <line class="unity" x1={PAD} x2={W - PAD} y1={unity} y2={unity} />
  </g>
  <path class="area" d="{curve} L{W - PAD} {PAD + box.height} L{PAD} {PAD + box.height} Z" />
  <path class="curve" d={curve} />
  {#if cutoff !== undefined}
    <line class="cutoff" x1={cutoff} x2={cutoff} y1={PAD} y2={PAD + box.height} />
  {/if}
</svg>

<style>
  .display {
    display: block;
    width: 100%;
    height: auto;
  }

  .grid line {
    stroke: var(--synth-screen-grid, rgb(141 255 181 / 0.1));
    stroke-dasharray: 2 3;
  }

  .grid .unity {
    stroke: var(--synth-screen-dim, rgb(141 255 181 / 0.35));
    stroke-dasharray: none;
  }

  .grid text {
    fill: var(--synth-screen-dim, rgb(141 255 181 / 0.55));
    font-size: 7px;
    font-family: inherit;
    text-anchor: middle;
  }

  .area {
    fill: var(--synth-screen-fill, rgb(141 255 181 / 0.12));
  }

  .curve {
    fill: none;
    stroke: var(--synth-screen-ink, #8dffb5);
    stroke-width: 1.6;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 3px var(--synth-screen-glow, rgb(141 255 181 / 0.6)));
  }

  .cutoff {
    stroke: var(--synth-accent, #ff7a2f);
    stroke-width: 1;
    stroke-dasharray: 1 2;
  }
</style>
