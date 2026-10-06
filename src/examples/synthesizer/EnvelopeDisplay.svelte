<script lang="ts">
  import { envelopePoints, holdFor, pathOf } from "./geometry.ts";
  import { format, params } from "./params.ts";
  import type { Envelope } from "./patch.ts";

  /** The envelope's shape, as a screen draws it: attack, decay, a held sustain, release. */
  let { envelope, active = false }: { envelope: Envelope; active?: boolean } =
    $props();

  const W = 240;
  const H = 92;
  const PAD = { x: 8, top: 10, bottom: 18 };
  const box = { width: W - 2 * PAD.x, height: H - PAD.top - PAD.bottom };

  const points = $derived(
    envelopePoints(envelope, box, holdFor(envelope)).map(
      ([x, y]) => [x + PAD.x, y + PAD.top] as const,
    ),
  );
  const curve = $derived(pathOf(points));
  const labels = $derived(
    (["A", "D", "S", "R"] as const).map((letter, i) => ({
      letter,
      x: (points[i][0] + points[i + 1][0]) / 2,
    })),
  );
  const description = $derived(
    `Envelope: attack ${format(envelope.attack, params.attack)}, ` +
      `decay ${format(envelope.decay, params.decay)}, ` +
      `sustain ${format(envelope.sustain, params.sustain)}, ` +
      `release ${format(envelope.release, params.release)}`,
  );
</script>

<svg
  class="display"
  class:active
  viewBox="0 0 {W} {H}"
  role="img"
  aria-label={description}
  data-display="envelope"
>
  <g class="grid" aria-hidden="true">
    {#each [0.25, 0.5, 0.75] as f}
      <line x1={PAD.x} x2={W - PAD.x} y1={PAD.top + f * box.height} y2={PAD.top + f * box.height} />
    {/each}
    {#each points.slice(1, -1) as [x]}
      <line class="corner" x1={x} x2={x} y1={PAD.top} y2={PAD.top + box.height} />
    {/each}
    <line class="floor" x1={PAD.x} x2={W - PAD.x} y1={PAD.top + box.height} y2={PAD.top + box.height} />
  </g>
  <path class="area" d="{curve} Z" />
  <path class="curve" d={curve} />
  {#each points.slice(1, -1) as [x, y]}
    <circle class="handle" cx={x} cy={y} r="2.4" />
  {/each}
  <g class="labels" aria-hidden="true">
    {#each labels as { letter, x }}
      <text {x} y={H - 5}>{letter}</text>
    {/each}
  </g>
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
    stroke-width: 1;
  }

  .grid .corner {
    stroke-dasharray: 2 3;
  }

  .grid .floor {
    stroke: var(--synth-screen-dim, rgb(141 255 181 / 0.35));
  }

  .area {
    fill: var(--synth-screen-fill, rgb(141 255 181 / 0.12));
  }

  .curve {
    fill: none;
    stroke: var(--synth-screen-ink, #8dffb5);
    stroke-width: 2;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 3px var(--synth-screen-glow, rgb(141 255 181 / 0.6)));
  }

  .handle {
    fill: var(--synth-screen, #0b120d);
    stroke: var(--synth-screen-ink, #8dffb5);
    stroke-width: 1.5;
  }

  .labels text {
    fill: var(--synth-screen-dim, rgb(141 255 181 / 0.55));
    font-size: 9px;
    font-family: inherit;
    text-anchor: middle;
    letter-spacing: 0.1em;
  }

  .active .area {
    fill: var(--synth-screen-fill-active, rgb(141 255 181 / 0.24));
  }

  @media (prefers-reduced-motion: no-preference) {
    .area {
      transition: fill 120ms;
    }
  }
</style>
