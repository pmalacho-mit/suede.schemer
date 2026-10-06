// Helpers for Matrix.svelte's snippet tests and examples, which import this
// module only as a type, so nothing of it reaches a build.
import { Model } from "../../../release";
import { initial, type MatrixData } from "./schema.ts";

/** A form model for the explorer, starting from the default data with `data` laid over it. */
export const explorer = (data: Partial<MatrixData> = {}) =>
  new Model("edit", { ...initial(), ...data });

/** The entries a, b, c, d of the typeset matrix inside `selector`, as printed. */
export const entries = (root: HTMLElement, selector: string) =>
  [...root.querySelectorAll(`${selector} [data-entry]`)].map((entry) =>
    entry.textContent!.trim(),
  );
