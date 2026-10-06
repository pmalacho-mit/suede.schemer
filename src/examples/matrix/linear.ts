// The linear algebra behind the explorer: every step as a 2×2 matrix, their
// composition, and what a matrix says about the plane (determinant, inverse,
// eigenvectors). Pure functions over plain tuples, so the form's data feeds
// them as it is.
import type {
  Expect,
  Invoke,
  Table,
} from "../../../suede.nests/dsl.import.meta.vitest.ts";
import type { rounded } from "./linear.harness.ts";

/** A point or a direction in the plane: [x, y]. */
export type Vec = [x: number, y: number];

/** A 2×2 matrix by rows, [[a, b], [c, d]]: its columns are where î and ĵ land. */
export type Mat = [row1: [a: number, b: number], row2: [c: number, d: number]];

/** The mirror lines a reflection can use. */
export type Axis = "x" | "y" | "y = x";

/** One step of the transformation, as the form describes it. */
export type Step =
  | { type: "rotation"; degrees: number }
  | { type: "scale"; x: number; y: number }
  | { type: "shear"; x: number; y: number }
  | { type: "reflection"; axis: Axis }
  | { type: "matrix"; matrix: Mat };

export type StepType = Step["type"];

/** What a step can be while it is being edited: missing fields, a cleared input. */
export type Draft = Step | Record<string, unknown> | null | undefined;

const EPSILON = 1e-9;

/** Rounds away floating-point dust, so cos 90° is 0 (and never -0). */
export const clean = (n: number): number =>
  Math.abs(n) < 1e-12 ? 0 : Math.round(n * 1e12) / 1e12 || 0;

/** A number from the form, or `fallback` when the input is empty or half-typed. */
const finite = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const tidy = (m: Mat): Mat => [
  [clean(m[0][0]), clean(m[0][1])],
  [clean(m[1][0]), clean(m[1][1])],
];

export const identity = (): Mat => [
  [1, 0],
  [0, 1],
];

declare namespace identity {
  /** î stays (1, 0) and ĵ stays (0, 1) */
  export type Columns = Expect<Invoke<typeof identity>, "=", [[1, 0], [0, 1]]>;
}

/** A counter-clockwise turn by `degrees` about the origin. */
export const rotation = (degrees: number): Mat => {
  const radians = (degrees * Math.PI) / 180;
  const [c, s] = [Math.cos(radians), Math.sin(radians)];
  return tidy([
    [c, -s],
    [s, c],
  ]);
};

declare namespace rotation {
  export type QuarterTurns = Table<
    typeof rotation,
    [
      [args: [degrees: 90], expected: [[0, -1], [1, 0]]],
      [args: [degrees: 180], expected: [[-1, 0], [0, -1]]],
      [args: [degrees: -90], expected: [[0, 1], [-1, 0]]],
      [args: [degrees: 360], expected: [[1, 0], [0, 1]]],
    ]
  >;
}

/** The matrix of one step. An unfinished step is the identity: it does nothing yet. */
export const stepMatrix = (step: Draft): Mat => {
  const s = (step ?? {}) as Record<string, unknown>;
  switch (s.type) {
    case "rotation":
      return rotation(finite(s.degrees, 0));
    case "scale":
      return [
        [finite(s.x, 1), 0],
        [0, finite(s.y, 1)],
      ];
    case "shear":
      return [
        [1, finite(s.x, 0)],
        [finite(s.y, 0), 1],
      ];
    case "reflection":
      return s.axis === "y"
        ? [
            [-1, 0],
            [0, 1],
          ]
        : s.axis === "y = x"
          ? [
              [0, 1],
              [1, 0],
            ]
          : [
              [1, 0],
              [0, -1],
            ];
    case "matrix": {
      const m = Array.isArray(s.matrix) ? (s.matrix as unknown[][]) : [];
      const at = (r: number, c: number) => finite(m[r]?.[c], r === c ? 1 : 0);
      return [
        [at(0, 0), at(0, 1)],
        [at(1, 0), at(1, 1)],
      ];
    }
    default:
      return identity();
  }
};

declare namespace stepMatrix {
  export type EachKind = Table<
    typeof stepMatrix,
    [
      [args: [step: { type: "scale"; x: 2; y: 3 }], expected: [[2, 0], [0, 3]]],
      [args: [step: { type: "shear"; x: 1; y: 0 }], expected: [[1, 1], [0, 1]]],
      [
        args: [step: { type: "reflection"; axis: "x" }],
        expected: [[1, 0], [0, -1]],
      ],
      [
        args: [step: { type: "reflection"; axis: "y" }],
        expected: [[-1, 0], [0, 1]],
      ],
      [
        args: [step: { type: "reflection"; axis: "y = x" }],
        expected: [[0, 1], [1, 0]],
      ],
      [
        args: [step: { type: "matrix"; matrix: [[1, 2], [3, 4]] }],
        expected: [[1, 2], [3, 4]],
      ],
    ]
  >;

  /** a step still being chosen does nothing */
  export type Unfinished = Expect<
    Invoke<typeof stepMatrix, [step: null]>,
    "=",
    [[1, 0], [0, 1]]
  >;

  /** a cleared field falls back to the step's neutral value */
  export type ClearedField = Expect<
    Invoke<typeof stepMatrix, [step: { type: "scale"; x: 2 }]>,
    "=",
    [[2, 0], [0, 1]]
  >;
}

/** The product AB: first B, then A. */
export const multiply = (a: Mat, b: Mat): Mat =>
  tidy([
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ]);

declare namespace multiply {
  /** rows times columns */
  export type RowsByColumns = Expect<
    Invoke<typeof multiply, [a: [[1, 2], [3, 4]], b: [[5, 6], [7, 8]]]>,
    "=",
    [[19, 22], [43, 50]]
  >;

  /** order matters: a shear then a quarter turn is not a quarter turn then a shear */
  export type NotCommutative = [
    Expect<
      Invoke<typeof multiply, [a: [[0, -1], [1, 0]], b: [[1, 1], [0, 1]]]>,
      "=",
      [[0, -1], [1, 1]]
    >,
    Expect<
      Invoke<typeof multiply, [a: [[1, 1], [0, 1]], b: [[0, -1], [1, 0]]]>,
      "=",
      [[1, -1], [1, 0]]
    >,
  ];
}

/** Every step in order, as one matrix: Sₙ ⋯ S₂ S₁ (the first step acts first). */
export const compose = (steps: readonly Draft[] | undefined): Mat =>
  (steps ?? []).reduce<Mat>(
    (product, step) => multiply(stepMatrix(step), product),
    identity(),
  );

declare namespace compose {
  /** no steps leave the plane as it is */
  export type Empty = Expect<
    Invoke<typeof compose, [steps: []]>,
    "=",
    [[1, 0], [0, 1]]
  >;

  /** two quarter turns make a half turn */
  export type Adds = Expect<
    Invoke<
      typeof compose,
      [
        steps: [
          { type: "rotation"; degrees: 90 },
          { type: "rotation"; degrees: 90 },
        ],
      ]
    >,
    "=",
    [[-1, 0], [0, -1]]
  >;

  /** the first step acts first: shear, then turn, is R·H */
  export type FirstActsFirst = Expect<
    Invoke<
      typeof compose,
      [
        steps: [
          { type: "shear"; x: 1; y: 0 },
          { type: "rotation"; degrees: 90 },
        ],
      ]
    >,
    "=",
    [[0, -1], [1, 1]]
  >;

  /** reversing the steps changes the result */
  export type OrderMatters = Expect<
    Invoke<
      typeof compose,
      [
        steps: [
          { type: "rotation"; degrees: 90 },
          { type: "shear"; x: 1; y: 0 },
        ],
      ]
    >,
    "=",
    [[1, -1], [1, 0]]
  >;
}

/** Where `m` sends the point `v`. */
export const apply = (m: Mat, [x, y]: Vec): Vec => [
  clean(m[0][0] * x + m[0][1] * y),
  clean(m[1][0] * x + m[1][1] * y),
];

declare namespace apply {
  /** a quarter turn sends î to ĵ */
  export type TurnsIHat = Expect<
    Invoke<typeof apply, [m: [[0, -1], [1, 0]], v: [1, 0]]>,
    "=",
    [0, 1]
  >;
}

/** The signed area of the unit square's image: negative when the plane is flipped. */
export const determinant = ([[a, b], [c, d]]: Mat): number =>
  clean(a * d - b * c);

declare namespace determinant {
  export type Areas = Table<
    typeof determinant,
    [
      [args: [m: [[1, 0], [0, 1]]], expected: 1],
      [args: [m: [[2, 0], [0, 3]]], expected: 6],
      [args: [m: [[1, 0], [0, -1]]], expected: -1],
      [args: [m: [[1, 2], [2, 4]]], expected: 0],
      [args: [m: [[1, 1], [0, 1]]], expected: 1],
    ]
  >;
}

/** The matrix that undoes `m`, or null when `m` flattens the plane (det = 0). */
export const inverse = (m: Mat): Mat | null => {
  const det = determinant(m);
  if (Math.abs(det) < EPSILON) return null;
  const [[a, b], [c, d]] = m;
  return tidy([
    [d / det, -b / det],
    [-c / det, a / det],
  ]);
};

declare namespace inverse {
  /** a scale is undone by its reciprocal */
  export type Scale = Expect<
    Invoke<typeof inverse, [m: [[2, 0], [0, 4]]]>,
    "=",
    [[0.5, 0], [0, 0.25]]
  >;

  /** a shear is undone by the opposite shear */
  export type Shear = Expect<
    Invoke<typeof inverse, [m: [[1, 1], [0, 1]]]>,
    "=",
    [[1, -1], [0, 1]]
  >;

  /** a matrix that flattens the plane has none */
  export type Singular = Expect<
    Invoke<typeof inverse, [m: [[1, 2], [2, 4]]]>,
    "=",
    null
  >;
}

/** The sum of the diagonal: the sum of the eigenvalues. */
export const trace = ([[a], [, d]]: Mat): number => clean(a + d);

/** The directions a matrix only stretches, and by how much. */
export type Eigen =
  | {
      kind: "real";
      /** largest first; repeated when the two are equal */
      values: [number, number];
      /** a unit vector per distinct direction (one for a shear) */
      vectors: Vec[];
      /** a multiple of the identity: every direction is an eigenvector */
      everyDirection: boolean;
    }
  | {
      /** a turn of some kind: no direction stays on its line */
      kind: "complex";
      re: number;
      im: number;
    };

const unit = ([x, y]: Vec): Vec => {
  const length = Math.hypot(x, y);
  // one sign for each direction, so a vector never flips between frames
  const sign = x < -EPSILON || (Math.abs(x) <= EPSILON && y < 0) ? -1 : 1;
  return [clean((sign * x) / length), clean((sign * y) / length)];
};

/** Real eigenvalues and unit eigenvectors when there are any; else the complex pair. */
export const eigen = (m: Mat): Eigen => {
  const [[a, b], [c, d]] = m;
  const tr = a + d;
  const discriminant = tr * tr - 4 * (a * d - b * c);
  const scale = Math.max(1, tr * tr);
  if (discriminant < -EPSILON * scale)
    return {
      kind: "complex",
      re: clean(tr / 2),
      im: clean(Math.sqrt(-discriminant) / 2),
    };
  const root = Math.sqrt(Math.max(0, discriminant));
  const values: [number, number] = [
    clean((tr + root) / 2),
    clean((tr - root) / 2),
  ];

  if (Math.abs(b) < EPSILON && Math.abs(c) < EPSILON) {
    // diagonal: the axes themselves
    if (Math.abs(a - d) < EPSILON)
      return {
        kind: "real",
        values,
        vectors: [
          [1, 0],
          [0, 1],
        ],
        everyDirection: true,
      };
    const vectors: Vec[] =
      a > d
        ? [
            [1, 0],
            [0, 1],
          ]
        : [
            [0, 1],
            [1, 0],
          ];
    return { kind: "real", values, vectors, everyDirection: false };
  }

  const direction = (lambda: number): Vec =>
    unit(Math.abs(b) >= Math.abs(c) ? [b, lambda - a] : [lambda - d, c]);
  const repeated = root < 1e-7 * Math.max(1, Math.abs(tr));
  return {
    kind: "real",
    values,
    vectors: repeated ? [direction(values[0])] : values.map(direction),
    everyDirection: false,
  };
};

declare namespace eigen {
  /** a scale stretches along the axes, larger first */
  export type Scale = Expect<
    Invoke<typeof eigen, [m: [[2, 0], [0, 3]]]>,
    "=",
    {
      kind: "real";
      values: [3, 2];
      vectors: [[0, 1], [1, 0]];
      everyDirection: false;
    }
  >;

  /** a shear keeps only the x-axis */
  export type Shear = Expect<
    Invoke<typeof eigen, [m: [[1, 1], [0, 1]]]>,
    "=",
    { kind: "real"; values: [1, 1]; vectors: [[1, 0]]; everyDirection: false }
  >;

  /** a quarter turn moves every direction: eigenvalues ±i */
  export type QuarterTurn = Expect<
    Invoke<typeof eigen, [m: [[0, -1], [1, 0]]]>,
    "=",
    { kind: "complex"; re: 0; im: 1 }
  >;

  /** a uniform scale keeps every direction */
  export type Uniform = Expect<
    Invoke<typeof eigen, [m: [[2, 0], [0, 2]]]>,
    "matches",
    { kind: "real"; values: [2, 2]; everyDirection: true }
  >;

  /** a reflection across y = x keeps the mirror line (λ = 1) and flips its normal (λ = −1) */
  export type Mirror = Expect<
    Invoke<
      typeof rounded,
      [value: Invoke<typeof eigen, [m: [[0, 1], [1, 0]]]>]
    >,
    "=",
    {
      kind: "real";
      values: [1, -1];
      vectors: [[0.7071, 0.7071], [0.7071, -0.7071]];
      everyDirection: false;
    }
  >;
}

/** How far along the tween is: which step is moving, and how far through it. */
export type Tween = { matrix: Mat; step: number; progress: number };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** A step's matrix `t` of the way from doing nothing (t = 0) to doing all of it (t = 1). */
export const partialStep = (step: Draft, t: number): Mat => {
  const s = (step ?? {}) as Record<string, unknown>;
  // a turn turns (rather than shrinking through the middle, as its entries would)
  if (s.type === "rotation") return rotation(finite(s.degrees, 0) * t);
  const [[a, b], [c, d]] = stepMatrix(step);
  return tidy([
    [lerp(1, a, t), lerp(0, b, t)],
    [lerp(0, c, t), lerp(1, d, t)],
  ]);
};

declare namespace partialStep {
  /** half of a quarter turn is an eighth turn */
  export type HalfATurn = Expect<
    Invoke<
      typeof rounded,
      [
        value: Invoke<
          typeof partialStep,
          [step: { type: "rotation"; degrees: 90 }, t: 0.5]
        >,
      ]
    >,
    "=",
    [[0.7071, -0.7071], [0.7071, 0.7071]]
  >;

  /** half of a scale by 3 is a scale by 2 */
  export type HalfAScale = Expect<
    Invoke<typeof partialStep, [step: { type: "scale"; x: 3; y: 1 }, t: 0.5]>,
    "=",
    [[2, 0], [0, 1]]
  >;
}

/**
 * The plane `t` of the way through the steps, from the identity (t = 0) to the
 * composed matrix (t = 1). The steps play one after another, each over an
 * equal share of t, so the order they act in is what you see.
 */
export const tween = (
  steps: readonly Draft[] | undefined,
  t: number,
): Tween => {
  const list = steps ?? [];
  if (list.length === 0) return { matrix: identity(), step: -1, progress: 1 };
  const along = Math.min(Math.max(t, 0), 1) * list.length;
  const step = Math.min(Math.floor(along), list.length - 1);
  const progress = clean(along - step);
  const before = compose(list.slice(0, step));
  return {
    matrix: multiply(partialStep(list[step], progress), before),
    step,
    progress,
  };
};

declare namespace tween {
  /** t = 0 is the identity */
  export type Start = Expect<
    Invoke<typeof tween, [steps: [{ type: "scale"; x: 3; y: 3 }], t: 0]>,
    "matches",
    { matrix: [[1, 0], [0, 1]]; step: 0; progress: 0 }
  >;

  /** t = 1 is the composed matrix */
  export type End = Expect<
    Invoke<
      typeof tween,
      [
        steps: [
          { type: "shear"; x: 1; y: 0 },
          { type: "rotation"; degrees: 90 },
        ],
        t: 1,
      ]
    >,
    "=",
    { matrix: [[0, -1], [1, 1]]; step: 1; progress: 1 }
  >;

  /** halfway through two steps, the first is done and the second is starting */
  export type Halfway = Expect<
    Invoke<
      typeof tween,
      [
        steps: [{ type: "shear"; x: 1; y: 0 }, { type: "scale"; x: 2; y: 2 }],
        t: 0.5,
      ]
    >,
    "=",
    { matrix: [[1, 1], [0, 1]]; step: 1; progress: 0 }
  >;
}

/** The two singular values: how much `m` stretches the plane at most and at least. */
export const singularValues = (m: Mat): [number, number] => {
  const [[a, b], [c, d]] = m;
  const sum = a * a + b * b + c * c + d * d;
  const det = Math.abs(a * d - b * c);
  const root = Math.sqrt(Math.max(0, sum * sum - 4 * det * det));
  return [
    clean(Math.sqrt((sum + root) / 2)),
    clean(Math.sqrt(Math.max(0, (sum - root) / 2))),
  ];
};

declare namespace singularValues {
  export type Stretches = Table<
    typeof singularValues,
    [
      [args: [m: [[3, 0], [0, 2]]], expected: [3, 2]],
      [args: [m: [[0, -1], [1, 0]]], expected: [1, 1]],
      [args: [m: [[1, 2], [2, 4]]], expected: [5, 0]],
    ]
  >;
}
