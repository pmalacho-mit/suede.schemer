<script lang="ts">
  import {
    apply,
    determinant,
    eigen,
    identity,
    type Mat,
    type Vec,
  } from "./linear.ts";
  import {
    arrowhead,
    coordinates,
    format,
    gridLines,
    orientation,
    outlines,
    reach,
    transform,
    type Outline,
  } from "./plot.ts";
  import type { MatrixData, Shape } from "./schema.ts";

  /**
   * The coordinate plane under `matrix`: the original grid faint and its image
   * bold, the shape before and after, î and ĵ before and after, the image of
   * the unit square (its signed area is the determinant) and the eigenvector
   * lines. The window is sized for `final`, so it holds still while `matrix`
   * tweens towards it.
   */
  let {
    matrix,
    final = matrix,
    shape,
    display,
  }: {
    matrix: Mat;
    final?: Mat;
    shape: Shape;
    display: MatrixData["display"];
  } = $props();

  const SIZE = 600;
  const id = $props.id();

  const base = $derived(outlines(shape));
  const radius = $derived(reach([identity(), final], base));
  const unit = $derived(SIZE / (2 * radius));

  const px = (v: Vec): Vec => [SIZE / 2 + v[0] * unit, SIZE / 2 - v[1] * unit];
  const pt = (v: Vec) => px(v).join(",");

  const path = (shapes: Outline[]) =>
    shapes
      .map(
        ({ points, closed }) =>
          "M" + points.map(pt).join(" L") + (closed ? " Z" : ""),
      )
      .join(" ");

  const before = $derived(path(base));
  const after = $derived(path(transform(matrix, base)));

  const faint = $derived(gridLines(identity(), radius));
  const bent = $derived(gridLines(matrix, radius));

  const ticks = $derived(
    Array.from({ length: 2 * radius - 1 }, (_, i) => i - radius + 1).filter(
      (k) => k !== 0,
    ),
  );

  const iHat = $derived(apply(matrix, [1, 0]));
  const jHat = $derived(apply(matrix, [0, 1]));
  const det = $derived(determinant(matrix));
  const sign = $derived(orientation(det));
  const square = $derived<Vec[]>([
    [0, 0],
    iHat,
    [iHat[0] + jHat[0], iHat[1] + jHat[1]],
    jHat,
  ]);
  const centroid = $derived(
    px([(iHat[0] + jHat[0]) / 2, (iHat[1] + jHat[1]) / 2]),
  );

  const eigens = $derived(eigen(matrix));

  /** where a label sits: past the tip of `v`, along it */
  const beyond = (v: Vec, gap = 16): Vec => {
    const [x, y] = px(v);
    const length = Math.hypot(v[0], v[1]);
    if (length < 1e-6) return [x + gap, y - gap];
    return [x + (v[0] / length) * gap, y - (v[1] / length) * gap];
  };

  /** an eigen line's label: near the window's edge, inside it */
  const edge = (v: Vec): Vec => {
    const far = (radius * 0.8) / Math.max(Math.abs(v[0]), Math.abs(v[1]));
    return px([v[0] * far, v[1] * far]);
  };

  const head = (tip: Vec) =>
    arrowhead(px([0, 0]), px(tip), 12)
      .map((p) => p.join(","))
      .join(" ");
</script>

{#snippet arrow(tip: Vec, name: "i" | "j", label: string, original: boolean)}
  {@const [x, y] = px(tip)}
  {@const at = beyond(tip, original ? 14 : 18)}
  <g
    class="vector {name}"
    class:original
    data-vector={original ? undefined : name}
    data-to={coordinates(tip)}
  >
    <line x1={SIZE / 2} y1={SIZE / 2} x2={x} y2={y} />
    <polygon points={head(tip)} />
    <text class="label halo" x={at[0]} y={at[1]}>{label}</text>
    <text class="label" x={at[0]} y={at[1]}>{label}</text>
  </g>
{/snippet}

<div class="frame">
<svg
  class="plane"
  viewBox="0 0 {SIZE} {SIZE}"
  role="img"
  aria-labelledby="{id}-title {id}-desc"
  data-shape={shape}
>
  <title id="{id}-title">The plane under the transformation</title>
  <desc id="{id}-desc">
    î goes to {coordinates(iHat)} and ĵ to {coordinates(jHat)}. The unit
    square's image has signed area {format(det)}: {sign.label}.
  </desc>
  <defs>
    <clipPath id="{id}-clip">
      <rect width={SIZE} height={SIZE} />
    </clipPath>
  </defs>

  <g clip-path="url(#{id}-clip)">
    <!-- the plane as it was: a faint grid, its axes, and their numbers -->
    <g class="grid faint">
      {#each faint as { from, to, axis }}
        <line
          class:axis
          x1={px(from)[0]}
          y1={px(from)[1]}
          x2={px(to)[0]}
          y2={px(to)[1]}
        />
      {/each}
    </g>
    <g class="ticks" aria-hidden="true">
      {#each ticks as k}
        <text x={px([k, 0])[0]} y={SIZE / 2 + 15} text-anchor="middle"
          >{format(k)}</text
        >
        <text x={SIZE / 2 - 7} y={px([0, k])[1] + 4} text-anchor="end"
          >{format(k)}</text
        >
      {/each}
    </g>

    <!-- the plane as the matrix leaves it -->
    <g class="grid bent">
      {#each bent as { from, to, axis }}
        <line
          class:axis
          x1={px(from)[0]}
          y1={px(from)[1]}
          x2={px(to)[0]}
          y2={px(to)[1]}
        />
      {/each}
    </g>

    {#if display.eigenvectors && eigens.kind === "real" && !eigens.everyDirection}
      <g class="eigen">
        {#each eigens.vectors as v, i}
          {@const value = eigens.values[eigens.vectors.length === 1 ? 0 : i]}
          {@const [x1, y1] = px([-v[0] * radius * 3, -v[1] * radius * 3])}
          {@const [x2, y2] = px([v[0] * radius * 3, v[1] * radius * 3])}
          {@const at = edge(v)}
          <line {x1} {y1} {x2} {y2} data-eigen={format(value)} />
          <text class="label halo" x={at[0]} y={at[1] - 8}
            >λ = {format(value)}</text
          >
          <text class="label" x={at[0]} y={at[1] - 8}>λ = {format(value)}</text>
        {/each}
      </g>
    {/if}

    {#if display.determinant}
      <g class="area" data-sign={sign.sign}>
        <polygon
          class="unit"
          points="{pt([0, 0])} {pt([1, 0])} {pt([1, 1])} {pt([0, 1])}"
        />
        <polygon class="image" points={square.map(pt).join(" ")} />
      </g>
    {/if}

    <!-- the shape before, dashed; and after, solid -->
    <path class="shape before" d={before} />
    <path class="shape after" class:open={shape === "Grid"} d={after} />

    {#if display.basis}
      {@render arrow([1, 0], "i", "î", true)}
      {@render arrow([0, 1], "j", "ĵ", true)}
      {@render arrow(iHat, "i", "Mî", false)}
      {@render arrow(jHat, "j", "Mĵ", false)}
    {/if}

    {#if display.determinant}
      <g class="area-label" data-sign={sign.sign}>
        <text class="label halo" x={centroid[0]} y={centroid[1] + 4}
          >det {format(det)}</text
        >
        <text class="label" x={centroid[0]} y={centroid[1] + 4}
          >det {format(det)}</text
        >
      </g>
    {/if}
  </g>
</svg>
</div>

<style>
  .frame {
    container-type: inline-size;
  }

  .plane {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    font-family: inherit;
    user-select: none;
  }

  .grid line {
    vector-effect: non-scaling-stroke;
  }

  .faint line {
    stroke: var(--grid-faint, #e7e5e4);
    stroke-width: 1;
  }

  .faint line.axis {
    stroke: var(--grid-axis, #a8a29e);
    stroke-width: 1.25;
  }

  .bent line {
    stroke: var(--grid-bent, #1f2937);
    stroke-opacity: 0.32;
    stroke-width: 1.25;
  }

  .bent line.axis {
    stroke-opacity: 0.85;
    stroke-width: 2;
  }

  .ticks text {
    font-size: 11px;
    fill: var(--muted, #78716c);
    font-variant-numeric: tabular-nums;
  }

  .eigen line {
    stroke: var(--eigen, #4a3aa7);
    stroke-width: 2;
    stroke-dasharray: 8 6;
  }

  .eigen .label:not(.halo) {
    fill: var(--ink, #1c1917);
  }

  .area .unit {
    fill: none;
    stroke: var(--muted, #78716c);
    stroke-width: 1;
    stroke-dasharray: 2 3;
  }

  .area .image {
    fill: var(--det-pos, #1baf7a);
    fill-opacity: 0.2;
    stroke: var(--det-pos, #1baf7a);
    stroke-width: 1.5;
  }

  .area[data-sign="-1"] .image {
    fill: var(--det-neg, #e34948);
    stroke: var(--det-neg, #e34948);
  }

  .shape {
    fill: none;
    stroke-linejoin: round;
  }

  .shape.before {
    stroke: var(--muted, #78716c);
    stroke-width: 1.25;
    stroke-dasharray: 4 4;
  }

  .shape.after {
    fill: var(--ink, #1c1917);
    fill-opacity: 0.1;
    stroke: var(--ink, #1c1917);
    stroke-width: 2.25;
  }

  .shape.after.open {
    fill: none;
  }

  .vector line {
    stroke-width: 3;
    stroke-linecap: round;
  }

  .vector.i {
    --c: var(--i-hat, #eb6834);
  }

  .vector.j {
    --c: var(--j-hat, #2a78d6);
  }

  .vector line {
    stroke: var(--c);
  }

  .vector polygon {
    fill: var(--c);
  }

  .vector.original line {
    stroke-width: 1.5;
    stroke-opacity: 0.5;
  }

  .vector.original polygon {
    fill-opacity: 0.5;
  }

  .label {
    font-size: 15px;
    font-weight: 600;
    text-anchor: middle;
    dominant-baseline: middle;
    fill: var(--ink, #1c1917);
    font-family: "STIX Two Math", "Cambria Math", Georgia, serif;
  }

  .original .label {
    font-size: 13px;
    font-weight: 500;
    fill: var(--muted, #78716c);
  }

  .area-label .label {
    font-family: inherit;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }

  /* a halo of the page colour behind each label, so it reads over the grid */
  .label.halo {
    fill: none;
    stroke: var(--card, #fff);
    stroke-width: 5;
    stroke-linejoin: round;
  }

  /* on a phone the figure is drawn at half size: its words stay readable */
  @container (max-width: 460px) {
    .label {
      font-size: 24px;
    }

    .original .label,
    .area-label .label {
      font-size: 20px;
    }

    .ticks text {
      font-size: 17px;
    }

    .label.halo {
      stroke-width: 7;
    }
  }
</style>
