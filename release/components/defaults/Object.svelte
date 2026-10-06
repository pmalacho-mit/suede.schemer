<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";
  let { node, model, renderChild }: Field.Props<"object"> = $props();

  import type Self from "./Object.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { acrossThemes } from "../../_internal/across.ts";
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
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    ObjectField,
    () => new Model("edit", { name: "", age: 0 }),
    "object",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
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
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const fieldset = view.getByRole("group");
      expect(fieldset.querySelector("legend")?.textContent?.trim()).toBe(
        "User",
      );
    }),
  )}
{/snippet}

{#snippet allPropertiesAreRenderedAsChildren(
  ObjectField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    ObjectField,
    () => new Model("edit", { name: "", age: 0, active: false }),
    "object",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
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
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      for (const path of ["name", "age", "active"])
        expect(element.querySelector(`[data-path="${path}"]`)).not.toBeNull();
    }),
  )}
{/snippet}

{#snippet nestedObjectsRenderAsNestedFieldsetsWithCorrectPaths(
  ObjectField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    ObjectField,
    () => new Model("edit", { address: { street: "", city: "" } }),
    "object",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      {#snippet child(
        node: Node,
        parent: "object" | "array" | "tuple" | "oneOf",
        index?: number,
      )}
        <AnyField {node} {model} {parent} {index} />
      {/snippet}
      <Component
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
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      expect(view.getAllByRole("group").length).toBeGreaterThanOrEqual(2);
      expect(
        element.querySelector('[data-path="address.street"]'),
      ).not.toBeNull();
      expect(
        element.querySelector('[data-path="address.city"]'),
      ).not.toBeNull();
    }),
  )}
{/snippet}
