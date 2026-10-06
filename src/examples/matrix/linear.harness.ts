// Helpers for the namespace tests in linear.ts and plot.ts, which import this
// module only as a type: values that a literal cannot state exactly.

/** Every number in `value`, rounded to `digits` places (irrational entries compared as written). */
export const rounded = <T>(value: T, digits = 4): T => {
  const scale = 10 ** digits;
  const walk = (v: unknown): unknown =>
    typeof v === "number"
      ? Math.round(v * scale) / scale || 0
      : Array.isArray(v)
        ? v.map(walk)
        : v && typeof v === "object"
          ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
          : v;
  return walk(value) as T;
};
