/*
 * Generates streaming steps that mimic LLM token-by-token output:
 * - strings arrive a few characters at a time
 * - array elements populate one by one (each element's fields also stream)
 * - object fields appear sequentially
 * - numbers and booleans arrive in a single step
 */
export function* streamSteps(
  data: unknown,
  chunk_size: number,
  base = "",
): Generator<{ path: string; value: unknown }> {
  if (typeof data === "string") {
    for (let i = chunk_size; i < data.length; i += chunk_size)
      yield { path: base, value: data.slice(0, i) };
    yield { path: base, value: data };
    return;
  }

  if (typeof data !== "object" || data === null) {
    yield { path: base, value: data };
    return;
  }

  if (Array.isArray(data)) {
    // Initialize to empty so the array container renders immediately
    if (base) yield { path: base, value: [] };
    for (let i = 0; i < data.length; i++)
      yield* streamSteps(
        data[i],
        chunk_size,
        base ? `${base}.${i}` : String(i),
      );
    return;
  }

  for (const [k, v] of Object.entries(data as Record<string, unknown>))
    yield* streamSteps(v, chunk_size, base ? `${base}.${k}` : k);
}
