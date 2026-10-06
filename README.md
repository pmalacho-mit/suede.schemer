# suede.schemer

Schemer (**S**<ins style="color:white"><sub style="color:grey">_velte s_</sub><span style="color:#aa1e1e">**chem**</span><sub>_a_</sub> <sub>_rend_</sub><span style="color:#aa1e1e">**er**</span><sub>_er_</sub></ins>)

This repo is a [suede dependency](https://github.com/pmalacho-mit/suede). 

To see the installable source code, please checkout the [release branch](https://github.com/pmalacho-mit/suede.schemer/tree/release).

## Installation

```bash
bash <(curl -fsSL https://suede.sh/install/release) --repo pmalacho-mit/suede.schemer
```

Run it where you want the dependency. It installs `./suede.schemer`, stages it, and prints what
else (if anything) has to be installed beside it.

<details>
<summary>
See alternative to using <a href="https://github.com/pmalacho-mit/suede#suedesh">suede.sh</a> script proxy
</summary>

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/pmalacho-mit/suede/refs/heads/main/scripts/install/release.sh) --repo pmalacho-mit/suede.schemer
```

</details>


## Usage

Build a render tree from a JSON Schema with `root`, hold the data in a `Model`, and draw
both with `<Schema>`:

```svelte
<script lang="ts">
  import { Model, Schema, root } from "./suede.schemer";

  const model = new Model("edit", { name: "Ada" }); // "edit" | "view" | "stream"
  const tree = root({
    type: "object",
    properties: { name: { type: "string", title: "Name" } },
  });
</script>

{#await tree then node}
  <Schema root={node} {model} />
{/await}
```

`model.data` holds what is entered. In `"stream"` mode the form is read-only and fills in as
you `model.set(...)` or `model.applyPartial(...)` (for example from an LLM's streamed output).

## Themes

A theme is a set of components, one per kind of field and per action, laid over the
defaults. Pass one to `<Schema>`:

```svelte
<script lang="ts">
  import { Schema, themes } from "./suede.schemer";
</script>

<Schema root={node} {model} theme={themes.paper} />
```

| Theme       | Look                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| `minimal`   | neutral greys, hairline borders, one dark accent; follows dark mode      |
| `material`  | Material Design 3-style filled fields, switches and tonal cards          |
| `paper`     | a warm, serif, printed form with ruled-line inputs                       |
| `terminal`  | dark and monospace, with bracketed controls and panel-drawn groups       |
| `brutalist` | thick borders, hard offset shadows and loud colours                      |

Every theme reads the same CSS variables, so you can retune one without writing CSS. Set
them on `<Schema>` (Svelte passes `--` props through as custom properties) or on any
ancestor:

```svelte
<Schema
  root={node}
  {model}
  theme={themes.minimal}
  --schemer-accent="#0f766e"
  --schemer-radius="12px"
/>
```

| Variable                    | What it sets                       |
| --------------------------- | ---------------------------------- |
| `--schemer-font`            | font family                        |
| `--schemer-font-size`       | base font size                     |
| `--schemer-text`            | text colour                        |
| `--schemer-muted`           | secondary text (descriptions)      |
| `--schemer-background`      | the form's background              |
| `--schemer-surface`         | inputs' background                 |
| `--schemer-border`          | borders and rules                  |
| `--schemer-accent`          | focus, checked and primary actions |
| `--schemer-accent-contrast` | text on the accent                 |
| `--schemer-danger`          | destructive actions                |
| `--schemer-radius`          | corner radius                      |
| `--schemer-spacing`         | the spacing unit                   |

A theme may add knobs of its own, named `--schemer-<theme>-*`, and documents them in its
`Container.svelte`.

To match the active theme in a renderer of your own, read its colours rather than setting
them: inside a theme's container, `--sc-<name>` (`--sc-accent`, `--sc-border`, …, one for each
variable above) holds the value the theme draws with, whether its own or one you set.

What draws a field, highest first: a renderer snippet passed to `<Schema>`, then the theme,
then the defaults. So a theme never stops you replacing one field by hand. A renderer is
named for what it draws, `.` in a path becoming `__`:

| Name                                             | Draws                                             |
| ------------------------------------------------ | ------------------------------------------------- |
| `address__city`                                  | the field at that path                            |
| `steps___item__degrees`                          | that field of every item of `steps` (`*` → `_item`) |
| `push__steps`, `splice__steps`, `insert__steps`  | an array's add, remove and insert buttons          |
| `string`, `object`, `oneOf`, …                   | every field of that kind not named otherwise       |

A renderer is handed what a component is: `{ node, model, parent, index, renderChild }`. A
`oneOf`'s path renderer draws the `oneOf` alone; its chosen variant (which has the same path)
is drawn by kind.

### Writing a theme

A theme is an object with a `name` and any of `container`, `byKind`, `byAction` and
`forArray` (see `Theme` and `Registry`). Whatever it leaves out, the defaults draw. Each
component takes the same props as the default it replaces, and gets its behavior from
`controls` (input types, read-only rules, enum mapping, the actions, array and variant
logic, with `controls.array.item(node, index)` for an array's item) and `ArrayAction`, so a
theme is markup and styles. `themes/minimal` is the reference.

This design follows the libraries that render forms from JSON Schema in other frameworks:
[react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form)'s themes (widgets,
fields and templates merged over the core, with "user > theme > defaults" precedence),
[JSON Forms](https://jsonforms.io/)' renderer sets (including a vanilla, plain-CSS one), and
[json-render](https://json-render.dev/)'s split between a catalog (here, the kinds and actions)
and the registries that implement it.

## Tests and documentation

The components carry their own tests and examples as
[suede.sweater-vest](https://github.com/pmalacho-mit/suede.sweater-vest) snippets, and the
TypeScript modules as [suede.nests](https://github.com/pmalacho-mit/suede.nests) namespace
tests, so each file documents how it is used. `npx vitest run` runs them all; `npm run dev`
lists every snippet as a page, including each theme's showcase (`_internal/Showcase.svelte`).

A component's tests run in the defaults and in every theme: each draws the component once per
theme (each theme's own component for that kind of field) and checks every copy, so a theme
that breaks what a default does fails the test, by name. On the dev server, each of those
pages shows the component in every theme side by side.

What the tests use and nothing else does (the helpers they import as types, the showcase)
lives in `_internal/`. It is not part of the API: don't import it.
