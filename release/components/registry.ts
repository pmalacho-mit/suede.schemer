import { getContext, setContext, type Component, type Snippet } from "svelte";
import type { Kind } from "../types.js";
import type { SchemaModel } from "../models.svelte.js";
import type { Field } from "./Field.svelte";
import { component } from "./defaults/index.js";

/** What a theme's container is handed: the model, and the form to wrap. */
export type ContainerProps = { model: SchemaModel; children: Snippet };

/**
 * Every component a form is drawn with — the catalog a theme implements:
 * a container around the whole form, one component per kind, and one per
 * action button.
 */
export type Registry = {
  container: Component<ContainerProps>;
  byKind: { [K in Kind]: Component<Field.Props<K>> };
  byAction: { [K in Field.ComponentActions]: Component<Field.Props> };
  forArray: { [K in Field.ArrayAction]: Component<Field.ArrayActionProps> };
};

/**
 * Any part of a registry, laid over the defaults: what a theme leaves out is
 * drawn by the defaults. Renderer snippets passed to `<Schema>` still win over
 * both (renderers > theme > defaults).
 */
export type Theme = {
  name: string;
  container?: Registry["container"];
  byKind?: Partial<Registry["byKind"]>;
  byAction?: Partial<Registry["byAction"]>;
  forArray?: Partial<Registry["forArray"]>;
};

const resolved = new WeakMap<Theme, Registry>();

/** The registry a theme makes: its components, and the defaults' for the rest. */
export const resolve = (theme?: Theme): Registry => {
  const defaults = component as Registry;
  if (!theme) return defaults;
  let registry = resolved.get(theme);
  if (!registry) {
    registry = {
      container: theme.container ?? defaults.container,
      byKind: { ...defaults.byKind, ...theme.byKind },
      byAction: { ...defaults.byAction, ...theme.byAction },
      forArray: { ...defaults.forArray, ...theme.forArray },
    };
    resolved.set(theme, registry);
  }
  return registry;
};

const key = Symbol("schemer.registry");

/** Makes the theme `theme()` returns the one every field below draws with. */
export const provideRegistry = (theme: () => Theme | undefined) =>
  setContext(key, () => resolve(theme()));

/** The registry to draw with: the nearest `<Schema>`'s, or the defaults outside one. */
export const useRegistry = (): (() => Registry) =>
  getContext<(() => Registry) | undefined>(key) ?? (() => resolve());
