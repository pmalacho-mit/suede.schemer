// The test every theme passes, shared by Showcase.svelte's snippets. They
// import this module only as a type, so it never reaches a build.
import type { Payload } from "../../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
import type { SchemaModel } from "../../models.svelte.js";

/**
 * Fills in every kind of field of the showcase form through `theme`'s
 * components, as a person would: by label, by click, by typing.
 */
export const editsEveryKind = async (
  { expect, screen, user, waitFor }: Payload,
  model: SchemaModel,
  theme: string,
) => {
  const input = (label: string) =>
    screen.getByLabelText(label) as HTMLInputElement & HTMLSelectElement;
  const within = (path: string, selector: string) =>
    model.element({ path })!.querySelector<HTMLElement>(selector)!;

  await waitFor(() =>
    expect(document.querySelector(`[data-theme="${theme}"]`)).not.toBeNull(),
  );
  await screen.findByLabelText("Full name");

  // string, number, boolean
  await user.clear(input("Full name"));
  await user.type(input("Full name"), "Grace Hopper");
  expect(model.get({ path: "name" })).toBe("Grace Hopper");
  await user.clear(input("Guests"));
  await user.type(input("Guests"), "3");
  expect(model.get({ path: "guests" })).toBe(3);
  await user.click(input("Join the workshop"));
  expect(model.get({ path: "workshop" })).toBe(false);

  // string options, an untyped enum, a const
  await user.selectOptions(input("Ticket"), "Student");
  expect(model.get({ path: "ticket" })).toBe("Student");
  await user.selectOptions(input("Shirt size"), "L");
  expect(model.get({ path: "shirt" })).toBe("L");
  expect(input("Event").disabled).toBe(true);

  // an optional field, opted in
  await user.click(within("nickname", '[data-action="opt-in"]'));
  await user.type(input("Nickname"), "Amazing Grace");
  expect(model.get({ path: "nickname" })).toBe("Amazing Grace");

  // a nested object, a tuple
  expect(input("City").value).toBe("London");
  expect(input("Row").value).toBe("F");

  // an array: add, remove
  await user.click(within("topics", '[data-action="push"]'));
  expect(model.get({ path: "topics" })).toEqual(["Runes", "Snippets", ""]);
  await user.click(within("topics", '[data-action="splice"]')); // the first item's
  expect(model.get({ path: "topics" })).toEqual(["Snippets", ""]);

  // a variant, switched
  await user.selectOptions(
    within("payment", '[data-role="variant-selector"] select'),
    "Invoice",
  );
  expect(model.get({ path: "payment" })).toEqual({ method: "invoice" });
  expect(await screen.findByLabelText("Company")).toBeDefined();
};
