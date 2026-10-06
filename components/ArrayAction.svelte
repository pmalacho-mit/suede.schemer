<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Field } from "./Field.svelte";
  import { useRegistry } from "./registry.js";

  /** One of an array's item actions: the user's renderer snippet if given, else the registry's component. */
  let {
    action,
    renderer,
    ...props
  }: Field.ArrayActionProps & {
    action: Field.ArrayAction;
    renderer: Snippet<[Field.ArrayActionProps]> | null;
  } = $props();

  const registry = useRegistry();
  const Component = $derived(registry().forArray[action]);
</script>

{#if renderer}
  {@render renderer(props)}
{:else}
  <Component {...props} />
{/if}
