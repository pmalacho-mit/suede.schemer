<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, title, tooltip } from "./common.js";

  let { node, model }: Field.Props<"boolean"> = $props();

  import type Self from "./Boolean.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
</script>

<label>
  <input
    type="checkbox"
    checked={model.get(node) ?? false}
    onchange={({ currentTarget: { checked } }) => model.set(node, checked)}
    disabled={!model.editable}
  />
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>
</label>

{#snippet rendersACheckbox(
  BooleanField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { active: false })}
  <BooleanField node={{ kind: "boolean", path: "active" }} {model} />
  {test(async ({ expect, screen }) => {
    expect(screen.getByRole("checkbox")).toBeDefined();
  })}
{/snippet}

{#snippet checkboxIsPreCheckedWhenDataValueIsTrue(
  BooleanField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { active: true })}
  <BooleanField node={{ kind: "boolean", path: "active" }} {model} />
  {test(async ({ expect, screen }) => {
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(
      true,
    );
  })}
{/snippet}

{#snippet clickingTheCheckboxUpdatesTheModel(
  BooleanField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", { active: false })}
  <BooleanField node={{ kind: "boolean", path: "active" }} {model} />
  {test(async ({ expect, screen, user }) => {
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    await user.click(checkbox);
    expect(model.get({ path: "active" })).toBe(true);
  })}
{/snippet}
