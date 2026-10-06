export { SchemaModel as Model } from "./models.svelte.js";
import type { RenderNode, Kind as TKind } from "./types.js";
import type { Theme as TTheme } from "./components/registry.js";
export type {
  Theme,
  Registry,
  ContainerProps,
} from "./components/registry.js";
/** What the defaults and every theme share: a field's behavior apart from its look, for writing a theme. */
export * as controls from "./components/defaults/common.js";
export { default as ArrayAction } from "./components/ArrayAction.svelte";
export { default as Schema } from "./components/Root.svelte";
export { root } from "./nodes.js";
export * as defaults from "./components/defaults/index.js";
export * as themes from "./components/themes/index.js";

export namespace Schema {
  export type Node = RenderNode;
  export type Kind = TKind;
  export type Theme = TTheme;
}
