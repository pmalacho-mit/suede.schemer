<script lang="ts" generics="P extends Record<string, any>">
  import type { Snippet } from "svelte";
  import { resolve } from "../components/registry.js";
  import type { Variant } from "./across.ts";
  import Provide from "./Provide.svelte";

  /**
   * Draws something once per variant (the defaults and every theme, from
   * `acrossThemes.variants`): each labelled, under its theme (so whatever it
   * draws through `Field` is that theme's too) and, unless `contained` is
   * false, inside its theme's container. The `variant` snippet draws it.
   */
  let {
    variants,
    variant,
    contained = true,
  }: {
    variants: Variant<P>[];
    variant: Snippet<[Variant<P>]>;
    /** false for what draws its own container, as `<Schema theme>` does */
    contained?: boolean;
  } = $props();
</script>

{#each variants as entry (entry.name)}
  {@const Container = resolve(entry.theme).container}
  <section data-variant={entry.name}>
    <h4>{entry.name}</h4>
    <Provide theme={entry.theme}>
      {#if contained}
        <Container model={entry.model}>
          {@render variant(entry)}
        </Container>
      {:else}
        {@render variant(entry)}
      {/if}
    </Provide>
  </section>
{/each}

<style>
  section + section {
    margin-top: 1rem;
  }

  h4 {
    margin: 0 0 0.4rem;
    font:
      600 12px/1.4 ui-monospace,
      monospace;
    color: #6b7280;
  }
</style>
