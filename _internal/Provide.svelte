<script lang="ts">
  import type { Snippet } from "svelte";
  import { provideRegistry, type Theme } from "../components/registry.js";

  /** Makes `theme` the one every field below draws with, as `<Schema theme>` does. */
  let { theme, children }: { theme: Theme | undefined; children: Snippet } =
    $props();

  provideRegistry(() => theme);
</script>

{@render children()}
