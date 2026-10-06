<script lang="ts" module>
  import type { RenderNode } from "../types";
  import type { Data, Mode, SchemaModel } from "../models.svelte.js";
  import type { Theme } from "./registry.js";

  export type Props<TMode extends Mode, TData extends Data> = {
    root: RenderNode;
    model: SchemaModel<TMode, TData>;
    /** The components to draw with, over the defaults; renderer snippets still win. */
    theme?: Theme;
    id?: string;
    class?: string;
  } & (Data extends TData ? {} : TField.Renderers<TData>);
</script>

<script lang="ts" generics="TMode extends Mode, TData extends Data">
  import Field, { type Field as TField } from "./Field.svelte";
  import { attributes } from "./defaults/common";
  import { provideRegistry } from "./registry.js";
  import type Self from "./Root.svelte";
  import type { Test } from "../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
  import type { acrossThemes } from "../_internal/across.ts";
  import type { root } from "../nodes.js";

  let {
    root: node,
    model,
    theme,
    id,
    class: _class,
    ...renderers
    // todo support all HTML Div attributes as props and spread them on the container element
  }: Props<TMode, TData> = $props();

  const registry = provideRegistry(() => theme);
  const Container = $derived(registry().container);
</script>

<div
  {id}
  class={_class}
  {...attributes.role("root-container")}
  bind:this={model.container}
>
  <Container {model}>
    <Field {node} {model} renderers={renderers as TField.Renderers} />
  </Container>
</div>

<!-- model.element(node) finds a field's element once <Schema> has drawn it -->
{#snippet modelElementReturnsTheDivForATopLevelField(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "" }))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() => expect(model.element({ path: "name" })).toBeDefined());
      expect(model.element({ path: "name" })?.dataset.path).toBe("name");
    }),
  )}
{/snippet}

{#snippet modelElementReturnsTheDivForANestedField(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { address: { city: "" } }))}
  {#await build( { type: "object", properties: { address: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } }, required: ["address"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "address.city" })).toBeDefined(),
      );
      expect(model.element({ path: "address.city" })?.dataset.path).toBe(
        "address.city",
      );
    }),
  )}
{/snippet}

{#snippet modelElementReturnsTheDivForAnArrayItem(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { tags: ["alpha", "beta"] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "tags.1" })).toBeDefined(),
      );
      expect(model.element({ path: "tags.0" })?.dataset.path).toBe("tags.0");
      expect(model.element({ path: "tags.1" })?.dataset.path).toBe("tags.1");
    }),
  )}
{/snippet}

{#snippet modelElementReturnsTheDivForAFieldNestedInsideAnArrayItem(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", {
    people: [{ name: "Alice" }, { name: "Bob" }],
  }))}
  {#await build( { type: "object", properties: { people: { type: "array", items: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } } }, required: ["people"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "people.1.name" })).toBeDefined(),
      );
      expect(model.element({ path: "people.0.name" })?.dataset.path).toBe(
        "people.0.name",
      );
      expect(model.element({ path: "people.1.name" })?.dataset.path).toBe(
        "people.1.name",
      );
    }),
  )}
{/snippet}

{#snippet modelElementReturnsUndefinedForAnOutOfBoundsArrayIndex(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { tags: ["alpha"] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "tags.0" })).toBeDefined(),
      );
      expect(model.element({ path: "tags.5" })).toBeUndefined();
    }),
  )}
{/snippet}

{#snippet modelElementReturnsUndefinedForANonExistentPath(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "" }))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() => expect(model.element({ path: "name" })).toBeDefined());
      expect(model.element({ path: "does.not.exist" })).toBeUndefined();
    }),
  )}
{/snippet}

<!-- root() resolves composition and references before anything is drawn -->
{#snippet allOfMergesPropertiesFromMultipleSubSchemas(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "", age: 0 }))}
  {#await build( { allOf: [{ type: "object", properties: { name: { type: "string" } }, required: ["name"] }, { type: "object", properties: { age: { type: "number" } }, required: ["age"] }] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element }) => {
      await waitFor(() => {
        expect(element.querySelector('[data-path="name"]')).not.toBeNull();
        expect(element.querySelector('[data-path="age"]')).not.toBeNull();
      });
    }),
  )}
{/snippet}

{#snippet refIsResolvedToTheReferencedDefinition(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "" }))}
  {#await build( { definitions: { Name: { type: "string", title: "Full Name" } }, type: "object", properties: { name: { $ref: "#/definitions/Name" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      expect(await view.findByLabelText("Full Name")).toBeDefined();
    }),
  )}
{/snippet}

<!-- edit mode: every field can be changed -->
{#snippet editInputsAreEnabled(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "", age: 0, active: false }))}
  {#await build( { type: "object", properties: { name: { type: "string" }, age: { type: "number" }, active: { type: "boolean" } }, required: ["name", "age", "active"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      for (const label of ["name", "age", "active"]) {
        const input = (await view.findByLabelText(label)) as HTMLInputElement;
        expect(input.disabled).toBe(false);
      }
    }),
  )}
{/snippet}

{#snippet editArrayHasPushAndSpliceButtons(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { tags: ["alpha"] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element }) => {
      await waitFor(() => {
        expect(element.querySelector('[data-action="push"]')).not.toBeNull();
        expect(element.querySelector('[data-action="splice"]')).not.toBeNull();
      });
    }),
  )}
{/snippet}

{#snippet editProgrammaticModelSetUpdatesAreReflectedInTheInput(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("edit", { name: "Alice" }))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, flushSync, within }) =>
    themes.each(variants, async ({ element, model }) => {
    const view = within(element);
      const input = (await view.findByLabelText("name")) as HTMLInputElement;
      expect(input.value).toBe("Alice");
      flushSync(() => model.set({ path: "name" }, "Bob"));
      expect(input.value).toBe("Bob");
    }),
  )}
{/snippet}

<!-- stream mode: read-only, filled in as data arrives -->
{#snippet streamInputsAreDisabled(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", { name: "Alice" }))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      const input = (await view.findByLabelText("name")) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    }),
  )}
{/snippet}

{#snippet streamArrayHasNoPushOrSpliceButtons(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", { tags: ["alpha"] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "tags.0" })).toBeDefined(),
      );
      expect(element.querySelector('[data-action="push"]')).toBeNull();
      expect(element.querySelector('[data-action="splice"]')).toBeNull();
    }),
  )}
{/snippet}

{#snippet streamRendersWithPartiallyDefinedDataWithoutCrashing(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", {}))}
  {#await build( { type: "object", properties: { name: { type: "string" }, age: { type: "number" } }, required: ["name", "age"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      expect(await view.findByLabelText("name")).toBeDefined();
      expect(await view.findByLabelText("age")).toBeDefined();
    }),
  )}
{/snippet}

{#snippet streamApplyPartialUpdatesAStringField(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", {}))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, flushSync, within }) =>
    themes.each(variants, async ({ element, model }) => {
    const view = within(element);
      const input = (await view.findByLabelText("name")) as HTMLInputElement;
      expect(input.value).toBe("");
      flushSync(() => model.applyPartial({ name: "Alice" }));
      expect(input.value).toBe("Alice");
    }),
  )}
{/snippet}

{#snippet streamApplyPartialUpdatesANumberField(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", {}))}
  {#await build( { type: "object", properties: { age: { type: "number" } }, required: ["age"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, flushSync, within }) =>
    themes.each(variants, async ({ element, model }) => {
    const view = within(element);
      const input = (await view.findByLabelText("age")) as HTMLInputElement;
      flushSync(() => model.applyPartial({ age: 42 }));
      expect(Number(input.value)).toBe(42);
    }),
  )}
{/snippet}

{#snippet streamApplyPartialUpdatesANestedFieldWithoutOverwritingSiblings(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", { address: { city: "Boston" } }))}
  {#await build( { type: "object", properties: { address: { type: "object", properties: { street: { type: "string" }, city: { type: "string" } }, required: ["street", "city"] } }, required: ["address"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, flushSync, within }) =>
    themes.each(variants, async ({ element, model }) => {
    const view = within(element);
      const street = (await view.findByLabelText("street")) as HTMLInputElement;
      const city = view.getByLabelText("city") as HTMLInputElement;
      flushSync(() => model.applyPartial({ address: { street: "123 Main St" } }));
      expect(street.value).toBe("123 Main St");
      expect(city.value).toBe("Boston"); // untouched
    }),
  )}
{/snippet}

{#snippet streamApplyPartialStreamsInArrayItemsOneByOne(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", { tags: [] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor, flushSync }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() => expect(model.element({ path: "tags" })).toBeDefined());
      const items = () => element.querySelectorAll('[data-path^="tags."]');
      expect(items()).toHaveLength(0);
      flushSync(() => model.set({ path: "tags" }, ["alpha"]));
      expect(items()).toHaveLength(1);
      flushSync(() => model.set({ path: "tags" }, ["alpha", "beta"]));
      expect(items()).toHaveLength(2);
    }),
  )}
{/snippet}

{#snippet streamMultipleApplyPartialCallsAccumulateIntoFinalState(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("stream", {}))}
  {#await build( { type: "object", properties: { first: { type: "string" }, last: { type: "string" } }, required: ["first", "last"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, flushSync, within }) =>
    themes.each(variants, async ({ element, model }) => {
    const view = within(element);
      const first = (await view.findByLabelText("first")) as HTMLInputElement;
      const last = view.getByLabelText("last") as HTMLInputElement;
      flushSync(() => {
        model.applyPartial({ first: "Jane" });
        model.applyPartial({ last: "Doe" });
      });
      expect(first.value).toBe("Jane");
      expect(last.value).toBe("Doe");
    }),
  )}
{/snippet}

<!-- view mode: read-only, with no actions -->
{#snippet viewStringInputIsDisabled(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("view", { name: "Alice" }))}
  {#await build( { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      const input = (await view.findByLabelText("name")) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    }),
  )}
{/snippet}

{#snippet viewCheckboxIsDisabled(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("view", { active: true }))}
  {#await build( { type: "object", properties: { active: { type: "boolean" } }, required: ["active"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      const checkbox = (await view.findByRole("checkbox")) as HTMLInputElement;
      expect(checkbox.disabled).toBe(true);
    }),
  )}
{/snippet}

{#snippet viewOptInAndOptOutButtonsAreAbsentForOptionalFields(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("view", { nickname: "Neo" }))}
  {#await build( { type: "object", properties: { nickname: { type: "string" } } }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, within }) =>
    themes.each(variants, async ({ element }) => {
    const view = within(element);
      expect(await view.findByLabelText("nickname")).toBeDefined();
      expect(element.querySelector('[data-action="opt-out"]')).toBeNull();
      expect(element.querySelector('[data-action="opt-in"]')).toBeNull();
    }),
  )}
{/snippet}

{#snippet viewArrayHasNoPushOrSpliceButtons(
  Schema: typeof Self,
  build: typeof root,
  Model: typeof SchemaModel,
  themes: typeof acrossThemes,
  test: Test,
)}
  {@const variants = themes.variants(Schema, () => new Model("view", { tags: ["alpha", "beta"] }))}
  {#await build( { type: "object", properties: { tags: { type: "array", items: { type: "string" } } }, required: ["tags"] }, ) then tree}
    <themes.Across {variants} contained={false}>
      {#snippet variant({ Component, model, theme })}
        <Component root={tree} {model} {theme} />
      {/snippet}
    </themes.Across>
  {/await}
  {test(async ({ expect, waitFor }) =>
    themes.each(variants, async ({ element, model }) => {
      await waitFor(() =>
        expect(model.element({ path: "tags.1" })).toBeDefined(),
      );
      expect(element.querySelector('[data-action="push"]')).toBeNull();
      expect(element.querySelector('[data-action="splice"]')).toBeNull();
    }),
  )}
{/snippet}
