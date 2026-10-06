// Runs a component's tests in the defaults and every theme. Tests import this
// module only as a type, so it never reaches a build.
import type { Component } from "svelte";
import type { SchemaModel } from "../models.svelte.js";
import type { Kind } from "../types.js";
import type { Field } from "../components/Field.svelte";
import { resolve, type Theme } from "../components/registry.js";
import { all } from "../components/themes/index.js";
import Across from "./Across.svelte";

/** One theme's copy of what a test draws. */
export type Variant<P extends Record<string, any>> = {
  /** "defaults", or the theme's name */
  name: string;
  /** the theme, or undefined for the defaults */
  theme: Theme | undefined;
  /** what to draw: the theme's component for the kind, or the snippet's own component */
  Component: Component<P>;
  /** a model of this copy's own */
  model: SchemaModel;
  /** where `<Across>` drew this copy (once it has) */
  readonly element: HTMLElement;
};

const named = [
  ["defaults", undefined],
  ...Object.entries(all),
] as const satisfies readonly (readonly [string, Theme | undefined])[];

/**
 * The defaults and every theme, each with a model of its own from `model`.
 * Given a `kind`, each theme draws with its own component for that kind (and
 * the defaults with `component`, the snippet's `Self`); without one, every
 * copy draws `component` itself, under its theme (as `Field` and `Schema` are).
 */
function variants<K extends Kind>(
  component: Component<Field.Props<K>>,
  model: () => SchemaModel,
  kind: K,
): Variant<Field.Props<K>>[];
function variants<P extends Record<string, any>>(
  component: Component<P>,
  model: () => SchemaModel,
): Variant<P>[];
function variants(
  component: Component<any>,
  model: () => SchemaModel,
  kind?: Kind,
): Variant<any>[] {
  return named.map(([name, theme]) => ({
    name,
    theme,
    Component: kind && theme ? resolve(theme).byKind[kind] : component,
    model: model(),
    get element() {
      return document.querySelector<HTMLElement>(`[data-variant="${name}"]`)!;
    },
  }));
}

/**
 * Runs `check` on each copy in turn, naming the theme in any failure
 * (`paper: expected false to be true`).
 */
const each = async <P extends Record<string, any>>(
  copies: Variant<P>[],
  check: (variant: Variant<P>) => Promise<void> | void,
) => {
  for (const variant of copies)
    try {
      await check(variant);
    } catch (error) {
      if (error instanceof Error)
        error.message = `${variant.name}: ${error.message}`;
      throw error;
    }
};

/**
 * Everything a test needs to run in every theme, as one import
 * (`themes: typeof acrossThemes`): `themes.variants(Self, model, kind?)`
 * makes the copies, `<themes.Across {variants}>` draws them, and
 * `themes.each(variants, check)` checks each.
 */
export const acrossThemes = { variants, Across, each };
