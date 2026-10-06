<script lang="ts">
  import type { Field } from "../Field.svelte";
  import {
    attributes,
    inputType,
    readonly,
    stringValue,
    title,
    tooltip,
  } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"string"> = $props();

  const value = $derived(stringValue(node, model));
  const disabled = $derived(readonly(node, model));

  import type Self from "./String.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { acrossThemes } from "../../_internal/across.ts";
  import type { SchemaModel } from "../../models.svelte.js";
</script>

<label>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>

  {#if node.options}
    <select {value} {disabled} onchange={model.on(node)}>
      <PlaceholderOption />
      {#each node.options as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  {:else}
    <input {value} type={inputType(node)} {disabled} oninput={model.on(node)} />
  {/if}
</label>

{#snippet rendersATextInput(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { name: "" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component node={{ kind: "string", path: "name" }} {model} />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("name") as HTMLInputElement;
      expect(input.type).toBe("text");
    }),
  )}
{/snippet}

{#snippet typingIntoTheInputUpdatesTheModel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { name: "" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component node={{ kind: "string", path: "name" }} {model} />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, user, within }) =>
    themes.each(variants, async ({ element, model }) => {
      const view = within(element);
      await user.type(view.getByLabelText("name"), "Alice");
      expect(model.get({ path: "name" })).toBe("Alice");
    }),
  )}
{/snippet}

{#snippet emailFormatRendersTypeEmail(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { email: "" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "string", path: "email", format: "email" }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("email") as HTMLInputElement;
      expect(input.type).toBe("email");
    }),
  )}
{/snippet}

{#snippet dateFormatRendersTypeDate(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { birthday: "" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "string", path: "birthday", format: "date" }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("birthday") as HTMLInputElement;
      expect(input.type).toBe("date");
    }),
  )}
{/snippet}

{#snippet constRendersAPreFilledDisabledInput(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", {}),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "string", path: "status", const: "active" }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const input = view.getByLabelText("status") as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input.value).toBe("active");
    }),
  )}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { color: "red" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{
          kind: "string",
          path: "color",
          options: ["red", "green", "blue"],
        }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
      const view = within(element);
      const select = view.getByRole("combobox") as HTMLSelectElement;
      const options = Array.from(select.options).filter((o) => !o.disabled);
      expect(options.map((o) => o.value)).toEqual(["red", "green", "blue"]);
    }),
  )}
{/snippet}

{#snippet titleAttributeAppearsInTheFieldLabel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { firstName: "" }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "string", path: "firstName", title: "First Name" }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      const name = element.querySelector('[data-role="name"]');
      expect(name?.textContent?.trim()).toBe("First Name");
    }),
  )}
{/snippet}

{#snippet pathAbbreviationShowsBasenameNotFullPathInLabel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(
    StringField,
    () => new Model("edit", { address: { streetName: "" } }),
    "string",
  )}
  <themes.Across {variants}>
    {#snippet variant({ Component, model })}
      <Component
        node={{ kind: "string", path: "address.streetName" }}
        {model}
      />
    {/snippet}
  </themes.Across>
  {test(async ({ expect }) =>
    themes.each(variants, async ({ element }) => {
      const name = element.querySelector('[data-role="name"]');
      expect(name?.textContent?.trim()).toBe("streetName");
    }),
  )}
{/snippet}
