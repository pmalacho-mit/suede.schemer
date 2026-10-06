<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  let { node, model, renderChild }: Field.Props<"object"> = $props();

  import type Self from "./Object.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderNode as Node } from "../../types.js";
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>
  {#each node.children as child (child.path)}
    {@render renderChild(child, "object")}
  {/each}
</fieldset>

{#snippet rendersAFieldsetWithItsTitleAsTheLegend(
  ObjectField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { name: "", age: 0 })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ObjectField
    node={{
      kind: "object",
      path: "",
      title: "User",
      children: [
        { kind: "string", path: "name" },
        { kind: "number", path: "age" },
      ],
      required: new Set(["name", "age"]),
    }}
    {model}
    renderChild={child}
  />
  {test(async ({ expect, screen }) => {
    const fieldset = screen.getByRole("group");
    expect(fieldset.querySelector("legend")?.textContent?.trim()).toBe("User");
  })}
{/snippet}

{#snippet allPropertiesAreRenderedAsChildren(
  ObjectField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { name: "", age: 0, active: false })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ObjectField
    node={{
      kind: "object",
      path: "",
      children: [
        { kind: "string", path: "name" },
        { kind: "number", path: "age" },
        { kind: "boolean", path: "active" },
      ],
      required: new Set(["name", "age", "active"]),
    }}
    {model}
    renderChild={child}
  />
  {test(async ({ expect }) => {
    for (const path of ["name", "age", "active"])
      expect(document.querySelector(`[data-path="${path}"]`)).not.toBeNull();
  })}
{/snippet}

{#snippet nestedObjectsRenderAsNestedFieldsetsWithCorrectPaths(
  ObjectField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { address: { street: "", city: "" } })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <AnyField {node} {model} {parent} {index} />
  {/snippet}
  <ObjectField
    node={{
      kind: "object",
      path: "",
      children: [
        {
          kind: "object",
          path: "address",
          children: [
            { kind: "string", path: "address.street" },
            { kind: "string", path: "address.city" },
          ],
          required: new Set(["street", "city"]),
        },
      ],
      required: new Set(["address"]),
    }}
    {model}
    renderChild={child}
  />
  {test(async ({ expect, screen }) => {
    expect(screen.getAllByRole("group").length).toBeGreaterThanOrEqual(2);
    expect(
      document.querySelector('[data-path="address.street"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-path="address.city"]')).not.toBeNull();
  })}
{/snippet}
