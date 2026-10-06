<script lang="ts">
  // Step 3: a form, as is. Hold the data in a Model ("edit" lets people
  // change it), make the schema into the tree of fields <Schema> draws, and
  // draw it. That's a working form: every field typed, titled and bounded
  // by the schema, with nothing else written.
  import { Model, Schema, root } from "../../../release";
  import { initial } from "./data.ts";
  import { schema } from "./schema.ts";

  const model = new Model("edit", structuredClone(initial));
  const tree = root(schema); // a promise: a schema's $refs may need fetching
</script>

{#await tree then node}
  <Schema root={node} {model} />
{/await}
