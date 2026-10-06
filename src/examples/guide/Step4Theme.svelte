<script lang="ts">
  // Step 4: a look. A theme swaps every field's component for its own, and
  // reads --schemer-* variables you can set right on <Schema> (or any
  // ancestor) to make it yours, with no CSS of your own.
  import { Model, Schema, root, themes } from "../../../release";
  import { initial } from "./data.ts";
  import { schema } from "./schema.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema);
</script>

{#await tree then node}
  <Schema
    root={node}
    {model}
    theme={themes.minimal}
    --schemer-accent="#7c3aed"
    --schemer-radius="12px"
  />
{/await}
