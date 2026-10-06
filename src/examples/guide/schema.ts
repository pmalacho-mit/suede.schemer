// Step 2: the schema. Describe the same data in JSON Schema: what each field is
// (type), what it may be (enum, minimum, maximum, multipleOf), what it is called
// (title), and how to fill it in (description, default, examples). The form is
// drawn from this, so every word here is something a person will read.
import type { JSONSchema7 } from "json-schema";

const seconds = (title: string, description: string): JSONSchema7 => ({
  type: "number",
  title,
  description,
  minimum: 0,
  maximum: 3,
  multipleOf: 0.01,
});

const filter = (type: string, title: string): JSONSchema7 => ({
  type: "object",
  title,
  properties: {
    type: { const: type }, // tells the choices apart
    cutoff: {
      type: "number",
      title: "Cutoff",
      description: "Hz: where the filter starts to bite.",
      minimum: 50,
      maximum: 12000,
      default: 2000,
    },
  },
  required: ["type", "cutoff"],
});

export const schema: JSONSchema7 = {
  type: "object",
  title: "Patch",
  properties: {
    name: { type: "string", title: "Name", examples: ["Glass bell"] },
    wave: {
      type: "string",
      title: "Wave",
      description: "The shape of each cycle: smooth to buzzy.",
      enum: ["sine", "triangle", "square", "sawtooth"],
    },
    octave: { type: "integer", title: "Octave", minimum: -2, maximum: 2 },
    volume: {
      type: "number",
      title: "Volume",
      minimum: 0,
      maximum: 1,
      multipleOf: 0.01,
    },
    envelope: {
      type: "object",
      title: "Envelope",
      description: "How each note starts and stops.",
      properties: {
        attack: seconds("Attack", "Seconds to reach full volume."),
        release: seconds("Release", "Seconds to fade to silence."),
      },
      required: ["attack", "release"],
    },
    harmonics: {
      type: "array",
      title: "Harmonics",
      description: "Quieter tones above the note, at a multiple of its pitch.",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          ratio: {
            type: "number",
            title: "Ratio",
            minimum: 1,
            maximum: 8,
            multipleOf: 0.5,
            default: 2,
          },
          level: {
            type: "number",
            title: "Level",
            minimum: 0,
            maximum: 1,
            multipleOf: 0.01,
            default: 0.3,
          },
        },
        required: ["ratio", "level"],
      },
    },
    filter: {
      title: "Filter",
      oneOf: [
        { type: "object", title: "Off", properties: { type: { const: "off" } }, required: ["type"] },
        filter("lowpass", "Low-pass"),
        filter("highpass", "High-pass"),
      ],
    },
  },
  required: ["name", "wave", "octave", "volume", "envelope", "harmonics", "filter"],
};
