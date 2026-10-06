// What the figure draws, in numbers: the shapes, the window onto the plane,
// the grid a matrix bends, arrowheads, and the way values are written out.
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import {
  apply,
  singularValues,
  type Draft,
  type Mat,
  type Vec,
} from "./linear.ts";
import type { Shape } from "./schema.ts";

/** A line through some points, closed back to the first when `closed`. */
export type Outline = { points: Vec[]; closed: boolean };

const range = (from: number, to: number, step: number) =>
  Array.from(
    { length: Math.round((to - from) / step) + 1 },
    (_, i) => from + i * step,
  );

const circle = (segments: number): Vec[] =>
  Array.from({ length: segments }, (_, i) => {
    const angle = (2 * Math.PI * i) / segments;
    return [Math.cos(angle), Math.sin(angle)] as Vec;
  });

/** A shape before any transformation, as outlines in plane coordinates. */
export const outlines = (shape: Shape): Outline[] => {
  switch (shape) {
    case "Unit square":
      return [
        {
          points: [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
          closed: true,
        },
      ];
    case "Grid":
      return range(-1, 1, 0.5).flatMap((k) => [
        {
          points: [
            [k, -1],
            [k, 1],
          ] as Vec[],
          closed: false,
        },
        {
          points: [
            [-1, k],
            [1, k],
          ] as Vec[],
          closed: false,
        },
      ]);
    case "Letter F":
      // upright in the first quadrant, its arms pointing right: a mirror shows at once
      return [
        {
          points: [
            [0, 0],
            [0.4, 0],
            [0.4, 0.8],
            [1, 0.8],
            [1, 1.15],
            [0.4, 1.15],
            [0.4, 1.6],
            [1.2, 1.6],
            [1.2, 2],
            [0, 2],
          ],
          closed: true,
        },
      ];
    case "Circle":
      return [{ points: circle(96), closed: true }];
  }
};

declare namespace outlines {
  /** the unit square is one closed outline of four corners */
  export type Square = Expect<
    Invoke<typeof outlines, [shape: "Unit square"]>,
    "=",
    [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]]; closed: true }]
  >;

  /** the grid is five lines each way */
  export type Grid = Expect<
    Invoke<typeof outlines, [shape: "Grid"]>["length"],
    "=",
    10
  >;

  /** the letter F is one closed outline of ten corners */
  export type LetterF = Expect<
    Invoke<typeof outlines, [shape: "Letter F"]>[0]["points"]["length"],
    "=",
    10
  >;
}

/** Every outline, sent through `m`. */
export const transform = (m: Mat, shape: Outline[]): Outline[] =>
  shape.map(({ points, closed }) => ({
    points: points.map((p) => apply(m, p)),
    closed,
  }));

declare namespace transform {
  /** a quarter turn stands the unit square on its left side */
  export type Turned = Expect<
    Invoke<
      typeof transform,
      [
        m: [[0, -1], [1, 0]],
        shape: [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]]; closed: true }],
      ]
    >,
    "=",
    [{ points: [[0, 0], [0, 1], [-1, 1], [-1, 0]]; closed: true }]
  >;
}

/**
 * How far the window reaches from the origin, in whole units: enough to show
 * every matrix's image of the shape and the basis, never less than 3 or more
 * than 9.
 */
export const reach = (matrices: Mat[], shape: Outline[]): number => {
  const points: Vec[] = [
    [1, 0],
    [0, 1],
    [1, 1],
    ...shape.flatMap((o) => o.points),
  ];
  let far = 0;
  for (const m of matrices)
    for (const p of points) {
      const [x, y] = apply(m, p);
      far = Math.max(far, Math.abs(x), Math.abs(y));
    }
  return Math.min(9, Math.max(3, Math.ceil(far * 1.15)));
};

declare namespace reach {
  export type Window = Table<
    typeof reach,
    [
      [args: [matrices: [[[1, 0], [0, 1]]], shape: []], expected: 3],
      [args: [matrices: [[[4, 0], [0, 1]]], shape: []], expected: 5],
      [args: [matrices: [[[100, 0], [0, 1]]], shape: []], expected: 9],
    ]
  >;
}

/** One line of the bent grid, in plane coordinates; `axis` for the images of the axes. */
export type GridLine = { from: Vec; to: Vec; axis: boolean };

/**
 * The lines x = k and y = k for every whole k, sent through `m`: enough of
 * them, and long enough, to cover a window of `radius` however `m` squeezes
 * the plane (up to a limit, for a matrix that flattens it).
 */
export const gridLines = (m: Mat, radius: number): GridLine[] => {
  const smallest = Math.max(singularValues(m)[1], 0.08);
  const count = Math.min(60, Math.ceil((radius * Math.SQRT2) / smallest));
  const length = Math.min(count, 200);
  const lines: GridLine[] = [];
  for (let k = -count; k <= count; k++) {
    lines.push({
      from: apply(m, [k, -length]),
      to: apply(m, [k, length]),
      axis: k === 0,
    });
    lines.push({
      from: apply(m, [-length, k]),
      to: apply(m, [length, k]),
      axis: k === 0,
    });
  }
  return lines;
};

declare namespace gridLines {
  /** the identity on a window of 3 needs every line out to 5 (the window's corners) */
  export type Identity = Expect<
    Invoke<typeof gridLines, [m: [[1, 0], [0, 1]], radius: 3]>["length"],
    "=",
    22
  >;

  /** the axes are marked, and a matrix carries them along */
  export type Axes = Expect<
    Invoke<typeof gridLines, [m: [[0, -1], [1, 0]], radius: 1]>,
    "matches",
    [
      { axis: false },
      { axis: false },
      { axis: false },
      { axis: false },
      { from: [2, 0]; to: [-2, 0]; axis: true },
      { from: [0, -2]; to: [0, 2]; axis: true },
      { axis: false },
      { axis: false },
      { axis: false },
      { axis: false },
    ]
  >;
}

/** The three corners of an arrowhead at `tip`, pointing away from `tail` (screen units). */
export const arrowhead = (tail: Vec, tip: Vec, size = 10): Vec[] => {
  const [dx, dy] = [tip[0] - tail[0], tip[1] - tail[1]];
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) return [];
  const [ux, uy] = [dx / length, dy / length];
  const back: Vec = [tip[0] - ux * size, tip[1] - uy * size];
  const half = size * 0.45;
  return [
    tip,
    [back[0] - uy * half, back[1] + ux * half],
    [back[0] + uy * half, back[1] - ux * half],
  ];
};

declare namespace arrowhead {
  /** pointing right: the tip, then the two barbs behind it */
  export type Right = Expect<
    Invoke<typeof arrowhead, [tail: [0, 0], tip: [20, 0], size: 10]>,
    "=",
    [[20, 0], [10, 4.5], [10, -4.5]]
  >;

  /** a vector of no length has no head */
  export type Zero = Expect<
    Invoke<typeof arrowhead, [tail: [5, 5], tip: [5, 5]]>,
    "isEmpty"
  >;
}

/** A number as a textbook prints it: at most two decimals, a true minus sign. */
export const format = (n: number, digits = 2): string => {
  if (!Number.isFinite(n)) return "—";
  const rounded = Number(n.toFixed(digits)) || 0;
  return rounded < 0 ? `−${-rounded}` : `${rounded}`;
};

declare namespace format {
  export type Numbers = Table<
    typeof format,
    [
      [args: [n: 1], expected: "1"],
      [args: [n: -1], expected: "−1"],
      [args: [n: 0.5], expected: "0.5"],
      [args: [n: 0.3333333], expected: "0.33"],
      [args: [n: -0.0001], expected: "0"],
      [args: [n: 1.999999], expected: "2"],
    ]
  >;
}

/** A vector as coordinates: (0, 1). */
export const coordinates = ([x, y]: Vec): string =>
  `(${format(x)}, ${format(y)})`;

declare namespace coordinates {
  export type Pair = Expect<
    Invoke<typeof coordinates, [v: [0, -1]]>,
    "=",
    "(0, −1)"
  >;
}

/** A step's short name, as it is written in the product: R(90°), S(2, 1), … */
export const symbol = (step: Draft): string => {
  const s = (step ?? {}) as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === "number" ? format(v) : "?");
  switch (s.type) {
    case "rotation":
      return `R(${n(s.degrees)}°)`;
    case "scale":
      return `S(${n(s.x)}, ${n(s.y)})`;
    case "shear":
      return `H(${n(s.x)}, ${n(s.y)})`;
    case "reflection":
      return `F(${typeof s.axis === "string" ? s.axis : "?"})`;
    case "matrix":
      return "A";
    default:
      return "?";
  }
};

declare namespace symbol {
  export type Names = Table<
    typeof symbol,
    [
      [args: [step: { type: "rotation"; degrees: 90 }], expected: "R(90°)"],
      [args: [step: { type: "scale"; x: 2; y: -1 }], expected: "S(2, −1)"],
      [args: [step: { type: "shear"; x: 1; y: 0 }], expected: "H(1, 0)"],
      [
        args: [step: { type: "reflection"; axis: "y = x" }],
        expected: "F(y = x)",
      ],
      [args: [step: null], expected: "?"],
    ]
  >;
}

/** The product the steps make, written as it multiplies: the last step on the left. */
export const product = (steps: readonly Draft[] | undefined): string =>
  steps?.length ? [...steps].reverse().map(symbol).join(" · ") : "I";

declare namespace product {
  /** a shear then a turn is written R · H */
  export type RightToLeft = Expect<
    Invoke<
      typeof product,
      [
        steps: [
          { type: "shear"; x: 1; y: 0 },
          { type: "rotation"; degrees: 90 },
        ],
      ]
    >,
    "=",
    "R(90°) · H(1, 0)"
  >;

  /** no steps is the identity */
  export type None = Expect<Invoke<typeof product, [steps: []]>, "=", "I">;
}

/** What the sign of the determinant says about the plane. */
export const orientation = (det: number) =>
  Math.abs(det) < 1e-9
    ? ({ sign: 0, label: "flattened onto a line" } as const)
    : det > 0
      ? ({ sign: 1, label: "orientation kept" } as const)
      : ({ sign: -1, label: "orientation flipped" } as const);

declare namespace orientation {
  export type Signs = Table<
    typeof orientation,
    [
      [args: [det: 2], expected: { sign: 1; label: "orientation kept" }],
      [args: [det: -1], expected: { sign: -1; label: "orientation flipped" }],
      [args: [det: 0], expected: { sign: 0; label: "flattened onto a line" }],
    ]
  >;
}
