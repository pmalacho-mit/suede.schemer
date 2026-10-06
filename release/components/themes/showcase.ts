import type { JSONSchema7 } from "json-schema";

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
