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
  test: Test,
)}
  {@const model = new Model("edit", { name: "" })}
  <StringField node={{ kind: "string", path: "name" }} {model} />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("name") as HTMLInputElement;
    expect(input.type).toBe("text");
  })}
{/snippet}

{#snippet typingIntoTheInputUpdatesTheModel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { name: "" })}
  <StringField node={{ kind: "string", path: "name" }} {model} />
  {test(async ({ expect, screen, user }) => {
    await user.type(screen.getByLabelText("name"), "Alice");
    expect(model.get({ path: "name" })).toBe("Alice");
  })}
{/snippet}

{#snippet emailFormatRendersTypeEmail(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { email: "" })}
  <StringField
    node={{ kind: "string", path: "email", format: "email" }}
    {model}
  />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("email") as HTMLInputElement;
    expect(input.type).toBe("email");
  })}
{/snippet}

{#snippet dateFormatRendersTypeDate(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { birthday: "" })}
  <StringField
    node={{ kind: "string", path: "birthday", format: "date" }}
    {model}
  />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("birthday") as HTMLInputElement;
    expect(input.type).toBe("date");
  })}
{/snippet}

{#snippet constRendersAPreFilledDisabledInput(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {})}
  <StringField
    node={{ kind: "string", path: "status", const: "active" }}
    {model}
  />
  {test(async ({ expect, screen }) => {
    const input = screen.getByLabelText("status") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.value).toBe("active");
  })}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { color: "red" })}
  <StringField
    node={{ kind: "string", path: "color", options: ["red", "green", "blue"] }}
    {model}
  />
  {test(async ({ expect, screen }) => {
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.options).filter((o) => !o.disabled);
    expect(options.map((o) => o.value)).toEqual(["red", "green", "blue"]);
  })}
{/snippet}

{#snippet titleAttributeAppearsInTheFieldLabel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { firstName: "" })}
  <StringField
    node={{ kind: "string", path: "firstName", title: "First Name" }}
    {model}
  />
  {test(async ({ expect }) => {
    const name = document.querySelector('[data-role="name"]');
    expect(name?.textContent?.trim()).toBe("First Name");
  })}
{/snippet}

{#snippet pathAbbreviationShowsBasenameNotFullPathInLabel(
  StringField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { address: { streetName: "" } })}
  <StringField node={{ kind: "string", path: "address.streetName" }} {model} />
  {test(async ({ expect }) => {
    const name = document.querySelector('[data-role="name"]');
    expect(name?.textContent?.trim()).toBe("streetName");
  })}
{/snippet}
