<script lang="ts" module>
  import type { RenderNode } from "../types";
  import type { Data, Mode, SchemaModel } from "../models.svelte.js";
  import type { Theme } from "./registry.js";

  export type Props<TMode extends Mode, TData extends Data> = {
    root: RenderNode;
    model: SchemaModel<TMode, TData>;
    /** The components to draw with, over the defaults; renderer snippets still win. */
    theme?: Theme;
    id?: string;
    class?: string;
  } & (Data extends TData ? {} : TField.Renderers<TData>);
</script>

<script lang="ts" generics="TMode extends Mode, TData extends Data">
  import Field, { type Field as TField } from "./Field.svelte";
  import { attributes } from "./defaults/common";
  import { provideRegistry } from "./registry.js";

  let {
    root: node,
    model,
    theme,
    id,
    class: _class,
    ...renderers
    // todo support all HTML Div attributes as props and spread them on the container element
  }: Props<TMode, TData> = $props();

  const registry = provideRegistry(() => theme);
  const Container = $derived(registry().container);
</script>

<div
  {id}
  class={_class}
  {...attributes.role("root-container")}
  bind:this={model.container}
>
  <Container {model}>
    <Field {node} {model} renderers={renderers as TField.Renderers} />
  </Container>
</div>
