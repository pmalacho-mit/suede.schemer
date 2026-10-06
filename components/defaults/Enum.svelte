<script lang="ts">
  import type { Field } from "../Field.svelte";
  import { attributes, onEnumChange, title, tooltip } from "./common.js";
  import PlaceholderOption from "./PlaceholderOption.svelte";

  let { node, model }: Field.Props<"enum"> = $props();

  import type Self from "./Enum.svelte";
  import type { Test } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { SchemaModel } from "../../models.svelte.js";
</script>

<label>
  <span title={tooltip(node, model)} {...attributes.role("name")}>
    {title(node, model)}
  </span>
  <select
    value={model.get(node)}
    disabled={!model.editable}
    onchange={onEnumChange(node, model)}
  >
    <PlaceholderOption />
    {#each node.options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</label>

{#snippet rendersASelectWithAllOptions(
  EnumField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {})}
  <EnumField
    node={{
      kind: "enum",
      path: "status",
      options: ["draft", "published", "archived"],
    }}
    {model}
  />
  {test(async ({ expect, screen }) => {
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    const options = Array.from(select.options).filter((o) => !o.disabled);
    expect(options.map((o) => o.value)).toEqual([
      "draft",
      "published",
      "archived",
    ]);
  })}
{/snippet}

{#snippet selectingAnOptionUpdatesTheModel(
  EnumField: typeof Self,
  Model: typeof SchemaModel,
  test: Test,
)}
  {@const model = new Model("edit", {})}
  <EnumField
    node={{
      kind: "enum",
      path: "status",
      options: ["draft", "published", "archived"],
    }}
    {model}
  />
  {test(async ({ expect, screen, user }) => {
    await user.selectOptions(screen.getByRole("combobox"), "published");
    expect(model.get({ path: "status" })).toBe("published");
  })}
{/snippet}
