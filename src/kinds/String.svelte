<script lang="ts">
  import type { ComponentProps } from "svelte";
  import type Self from "./String.svelte";
  import type { Test } from "../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import { Schema, type Model } from "../../release";
  import type { renderSchema } from "../common.ts";

  let props: ComponentProps<typeof Schema> = $props();
</script>

<Schema {...props} />

{#snippet rendersATextInput(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { name: "" }, {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        });
    const input = pocket.el.querySelector(
      '[data-path="name"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.type).toBe("text");
  })}
{/snippet}

{#snippet typingIntoTheInputUpdatesTheModel(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect, user }) => {
    await render(pocket, "edit", { name: "" }, {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        });
    const input = pocket.el.querySelector(
      '[data-path="name"] input',
    ) as HTMLInputElement;
    await user.type(input, "Alice");
    expect(pocket.model.get({ kind: "string", path: "name" })).toBe("Alice");
  })}
{/snippet}

{#snippet emailFormatRendersTypeEmail(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { email: "" }, {
          type: "object",
          properties: { email: { type: "string", format: "email" } },
          required: ["email"],
        });
    const input = pocket.el.querySelector(
      '[data-path="email"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.type).toBe("email");
  })}
{/snippet}

{#snippet dateFormatRendersTypeDate(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { birthday: "" }, {
          type: "object",
          properties: { birthday: { type: "string", format: "date" } },
          required: ["birthday"],
        });
    const input = pocket.el.querySelector(
      '[data-path="birthday"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.type).toBe("date");
  })}
{/snippet}

{#snippet constRendersAPreFilledDisabledInput(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", {}, {
          type: "object",
          properties: { status: { type: "string", const: "active" } },
          required: ["status"],
        });
    const input = pocket.el.querySelector(
      '[data-path="status"] input',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input!.disabled).toBe(true);
    expect(input!.value).toBe("active");
  })}
{/snippet}

{#snippet enumOptionsRenderAsASelectElement(
  Harness: typeof Self,
  pocket: { model: Model; root: Schema.Node; el: HTMLDivElement },
  render: typeof renderSchema,
  test: Test,
)}
  <div bind:this={pocket.el}>
    {#if pocket.root}<Harness root={pocket.root} model={pocket.model} />{/if}
  </div>
  {test(async ({ expect }) => {
    await render(pocket, "edit", { color: "red" }, {
          type: "object",
          properties: {
            color: { type: "string", enum: ["red", "green", "blue"] },
          },
          required: ["color"],
        });
    const select = pocket.el.querySelector(
      '[data-path="color"] select',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    const opts = Array.from(select!.options).filter((o) => !o.disabled);
    expect(opts.map((o) => o.value)).toEqual(["red", "green", "blue"]);
  })}
{/snippet}
