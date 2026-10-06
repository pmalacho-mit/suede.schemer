<script lang="ts">
  import type { ContainerProps } from "../registry.js";

  /** No styling of its own: the form, as it is. */
  let { children }: ContainerProps = $props();
</script>

{@render children()}
