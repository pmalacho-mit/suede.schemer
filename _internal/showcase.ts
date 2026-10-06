// The form every theme is shown and checked with (Showcase.svelte). Not part
// of the API: the test below needs vitest's payload, and imports nothing that
// reaches a build.
import type { JSONSchema7 } from "json-schema";
import type { Payload } from "../../suede.sweater-vest.schemer/dsl.import.meta.vitest.ts";
import type { SchemaModel } from "../models.svelte.js";

/** A schema with every kind of field a theme draws, for previews and tests. */
export const schema: JSONSchema7 = {
  type: "object",
  title: "Conference registration",
  description: "Every kind of field, as this theme draws it.",
  properties: {
    name: {
      type: "string",
      title: "Full name",
      description: "As it should appear on your badge.",
    },
    email: { type: "string", format: "email", title: "Email" },
    arrival: { type: "string", format: "date", title: "Arrival date" },
    ticket: {
      type: "string",
      title: "Ticket",
      enum: ["Standard", "Student", "Speaker"],
    },
    event: { type: "string", title: "Event", const: "SvelteConf 2026" },
    guests: { type: "integer", title: "Guests", minimum: 0, maximum: 4 },
    workshop: {
      type: "boolean",
      title: "Join the workshop",
      description: "Limited to 40 seats.",
    },
    shirt: { title: "Shirt size", enum: ["S", "M", "L", "XL"] },
    nickname: { type: "string", title: "Nickname" },
    address: {
      type: "object",
      title: "Address",
      properties: {
        street: { type: "string", title: "Street" },
        city: { type: "string", title: "City" },
        coordinates: {
          type: "object",
          title: "Coordinates",
          description: "A group inside a group.",
          properties: {
            latitude: {
              type: "number",
              title: "Latitude",
              minimum: -90,
              maximum: 90,
            },
            longitude: {
              type: "number",
              title: "Longitude",
              minimum: -180,
              maximum: 180,
            },
          },
          required: ["latitude", "longitude"],
        },
      },
      required: ["street", "city", "coordinates"],
    },
    topics: {
      type: "array",
      title: "Topics",
      items: { type: "string" },
      maxItems: 5,
    },
    sessions: {
      type: "array",
      title: "Sessions",
      items: {
        type: "object",
        properties: {
          title: { type: "string", title: "Title" },
          minutes: { type: "number", title: "Minutes", enum: [15, 30, 45] },
        },
        required: ["title", "minutes"],
      },
    },
    seat: {
      type: "array",
      title: "Seat",
      description: "Row and number.",
      items: [
        { type: "string", title: "Row" },
        { type: "integer", title: "Number" },
      ],
    },
    payment: {
      title: "Payment",
      oneOf: [
        {
          type: "object",
          title: "Card",
          properties: {
            method: { type: "string", const: "card" },
            number: { type: "string", title: "Card number" },
          },
          required: ["method", "number"],
        },
        {
          type: "object",
          title: "Invoice",
          properties: {
            method: { type: "string", const: "invoice" },
            company: { type: "string", title: "Company" },
          },
          required: ["method", "company"],
        },
      ],
    },
  },
  required: [
    "name",
    "email",
    "arrival",
    "ticket",
    "event",
    "guests",
    "workshop",
    "shirt",
    "address",
    "topics",
    "sessions",
    "seat",
    "payment",
  ],
};

/** Data for `schema`, leaving the optional nickname out (so it can be opted in). */
export const data = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  arrival: "2026-11-02",
  ticket: "Speaker",
  event: "SvelteConf 2026",
  guests: 1,
  workshop: true,
  shirt: "M",
  address: {
    street: "12 St James's Square",
    city: "London",
    coordinates: { latitude: 51.5074, longitude: -0.1357 },
  },
  topics: ["Runes", "Snippets"],
  sessions: [{ title: "Notes on the Analytical Engine", minutes: 45 }],
  seat: ["F", 12],
  payment: { method: "card", number: "4242 4242 4242 4242" },
};

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
