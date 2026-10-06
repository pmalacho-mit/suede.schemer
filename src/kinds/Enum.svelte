<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./Enum.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema, sharedSchemas } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersASelectWithAllOptions(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  schemas: typeof sharedSchemas,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", {}, schemas.status);
    const select = pocket.el.querySelector(
      '[data-kind="enum"] select',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    const opts = Array.from(select!.options).filter((o) => !o.disabled);
    expect(opts.map((o) => o.value)).toEqual([
      "draft",
      "published",
      "archived",
    ]);
  })}
{/snippet}

{#snippet selectingAnOptionUpdatesTheModel(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  schemas: typeof sharedSchemas,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, user }) => {
    await render(pocket, "edit", {}, schemas.status);
    const select = pocket.el.querySelector(
      '[data-kind="enum"] select',
    ) as HTMLSelectElement;
    await user.selectOptions(select, "published");
    expect(pocket.model.get({ path: "status" })).toBe("published");
  })}
{/snippet}
