<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, tooltip, title, variants } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model, renderChild }: Field.Props<"oneOf"> = $props();

  const selected = $derived(variants.selected(node, model));

  import type Self from "./OneOf.svelte";
  import type FieldComponent from "../Field.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
  import type { RenderNode as Node } from "../../types.js";
</script>

<fieldset>
  <legend title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </legend>

  {#if model.editable}
    <label {...attributes.role("variant-selector")}>
      <span {...attributes.role("name")}>Type</span>
      <select
        value={selected}
        onchange={({ currentTarget: { value } }) =>
          variants.select(node, model, value)}
      >
        <PlaceholderOption />
        {#each node.variants as variant, i}
          <option value={i}>{variants.label(variant, i)}</option>
        {/each}
      </select>
    </label>
  {/if}

  {#if selected >= 0}
    {@render renderChild(node.variants[selected], "oneOf")}
  {/if}
</fieldset>

{#snippet rendersAVariantSelectorDropdown(
  OneOfField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { contact: {} })}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <OneOfField node={{
      kind: "oneOf",
      path: "contact",
      variants: [
        {
          kind: "object",
          path: "contact",
          title: "Email",
          children: [{ kind: "string", path: "contact.email", format: "email" }],
          required: new Set(["email"]),
        },
        {
          kind: "object",
          path: "contact",
          title: "Phone",
          children: [{ kind: "string", path: "contact.phone" }],
          required: new Set(["phone"]),
        },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-role="variant-selector"] select')).not.toBeNull();
  })}
{/snippet}

{#snippet optionLabelsInTheSelectorMatchSchemaTitles(
  OneOfField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {})}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <OneOfField node={{
      kind: "oneOf",
      path: "",
      variants: [
        { kind: "string", path: "", title: "Text" },
        { kind: "number", path: "", title: "Count" },
        { kind: "boolean", path: "", title: "Flag" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect, screen }) => {
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const labels = Array.from(select.options)
      .filter((o) => !o.disabled)
      .map((o) => o.text);
    expect(labels).toEqual(["Text", "Count", "Flag"]);
  })}
{/snippet}

{#snippet selectingAVariantRendersItsFields(
  OneOfField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {})}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <OneOfField node={{
      kind: "oneOf",
      path: "",
      variants: [
        { kind: "string", path: "", title: "Text" },
        { kind: "number", path: "", title: "Count" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect, screen, user }) => {
    await user.selectOptions(screen.getByRole("combobox"), "Text");
    expect(document.querySelector('[data-kind="string"]')).not.toBeNull();
  })}
{/snippet}

{#snippet preSelectsTheVariantThatMatchesExistingData(
  OneOfField: typeof Self,
  Field: typeof FieldComponent,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", 42 as unknown as {})}
  {#snippet child(
    node: Node,
    parent: "object" | "array" | "tuple" | "oneOf",
    index?: number,
  )}
    <Field {node} {model} {parent} {index} />
  {/snippet}
  <OneOfField node={{
      kind: "oneOf",
      path: "",
      variants: [
        { kind: "string", path: "", title: "Text" },
        { kind: "number", path: "", title: "Count" },
      ],
    }} {model} renderChild={child} />
  {test(async ({ expect }) => {
    expect(document.querySelector('[data-kind="number"] input')).not.toBeNull();
  })}
{/snippet}
