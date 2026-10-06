<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, tooltip, title, variants } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model, renderChild }: Field.Props<"oneOf"> = $props();

  const selected = $derived(variants.selected(node, model));

  import type Self from "./OneOf.svelte";
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
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    OneOfField,
    () => new Model("edit", { contact: {} }),
    "oneOf",
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
          kind: "oneOf",
          path: "contact",
          variants: [
            {
              kind: "object",
              path: "contact",
              title: "Email",
              children: [
                { kind: "string", path: "contact.email", format: "email" },
              ],
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
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      expect(
        element.querySelector('[data-role="variant-selector"] select'),
      ).not.toBeNull();
    }),
  )}
{/snippet}

{#snippet optionLabelsInTheSelectorMatchSchemaTitles(
  OneOfField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    OneOfField,
    () => new Model("edit", {}),
    "oneOf",
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
          kind: "oneOf",
          path: "",
          variants: [
            { kind: "string", path: "", title: "Text" },
            { kind: "number", path: "", title: "Count" },
            { kind: "boolean", path: "", title: "Flag" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const select = view.getByRole("combobox") as HTMLSelectElement;
      const labels = Array.from(select.options)
        .filter((o) => !o.disabled)
        .map((o) => o.text);
      expect(labels).toEqual(["Text", "Count", "Flag"]);
    }),
  )}
{/snippet}

{#snippet selectingAVariantRendersItsFields(
  OneOfField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    OneOfField,
    () => new Model("edit", {}),
    "oneOf",
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
          kind: "oneOf",
          path: "",
          variants: [
            { kind: "string", path: "", title: "Text" },
            { kind: "number", path: "", title: "Count" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, user, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      await user.selectOptions(view.getByRole("combobox"), "Text");
      expect(element.querySelector('[data-kind="string"]')).not.toBeNull();
    }),
  )}
{/snippet}

{#snippet preSelectsTheVariantThatMatchesExistingData(
  OneOfField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    OneOfField,
    () => new Model("edit", 42 as unknown as {}),
    "oneOf",
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
          kind: "oneOf",
          path: "",
          variants: [
            { kind: "string", path: "", title: "Text" },
            { kind: "number", path: "", title: "Count" },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      expect(
        element.querySelector('[data-kind="number"] input'),
      ).not.toBeNull();
    }),
  )}
{/snippet}

<!-- a new variant starts with its defaults, keeping what the old one had for a field both have -->
{#snippet switchingVariantsKeepsTheFieldsTheyShare(
  OneOfField: typeof Self,
  AnyField: typeof FieldComponent,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    OneOfField,
    () => new Model("edit", { filter: { type: "lowpass", cutoff: 800 } }),
    "oneOf",
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
          kind: "oneOf",
          path: "filter",
          variants: [
            {
              kind: "object",
              path: "filter",
              title: "Low-pass",
              children: [
                { kind: "string", path: "filter.type", const: "lowpass" },
                { kind: "number", path: "filter.cutoff" },
              ],
              required: new Set(["type", "cutoff"]),
            },
            {
              kind: "object",
              path: "filter",
              title: "High-pass",
              children: [
                { kind: "string", path: "filter.type", const: "highpass" },
                { kind: "number", path: "filter.cutoff" },
                { kind: "number", path: "filter.resonance", default: 1 },
              ],
              required: new Set(["type", "cutoff", "resonance"]),
            },
          ],
        }}
        {model}
        renderChild={child}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, user }) =>
    themes.each(variants, async ({ element, model }) => {
      await user.selectOptions(
        element.querySelector('[data-role="variant-selector"] select')!,
        "High-pass",
      );
      expect(model.get({ path: "filter" })).toEqual({
        type: "highpass",
        cutoff: 800,
        resonance: 1,
      });
    }),
  )}
{/snippet}
