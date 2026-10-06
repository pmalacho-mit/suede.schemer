<script lang="ts">
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { defaults, Model, root, Schema, type Theme } from "../../../release";
  import type { Field } from "../../../release/components/Field.svelte";
  import { schema, type Shelf } from "./bookshelf.ts";
  import { dirname, join, type FileSystem } from "./files.ts";
  import {
    isReference,
    load,
    originOf,
    save,
    type Loaded,
    type Saved,
  } from "./refs.ts";

  import type Self from "./DataRefs.svelte";
  import type { Test } from "../../../suede.sweater-vest/dsl.import.meta.vitest.ts";
  import type { inMemory, served } from "./bookshelf.ts";
  import type { overlay } from "./files.ts";
  import type { themes as allThemes } from "../../../release";

  /**
   * One document assembled from several files by `$ref`s in its data: edited
   * in a form as one, saved back to each file it came from.
   */
  let {
    fs,
    entry = "shelf.json",
    theme,
  }: { fs: FileSystem; entry?: string; theme?: Theme } = $props();

  const tree = root(schema);

  let loaded = $state.raw<Loaded>();
  let model = $state.raw<Model<"edit", Shelf>>();
  let failure = $state<string>();
  let report = $state.raw<Saved>();
  let saving = $state(false);
  let paths = $state.raw<string[]>([]);
  let selected = $state<string>();
  let shown = $state.raw<unknown>();
  const edited = new SvelteSet<string>();

  const open = async (file: string) => {
    selected = file;
    shown = await fs.read(file);
  };

  const reload = async () => {
    try {
      loaded = await load(fs, entry);
      model = new Model("edit", loaded.data as unknown as Shelf);
      paths = await fs.list();
      failure = undefined;
      await open(selected ?? entry);
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    }
  };

  const persist = async () => {
    if (!loaded || !model) return;
    saving = true;
    const data = $state.snapshot(model.data) as unknown as Record<
      string,
      unknown
    >;
    report = await save(fs, loaded, data);
    report.written.forEach((file) => edited.add(file));
    await reload();
    saving = false;
  };

  const discard = async () => {
    report = undefined;
    await reload();
  };

  reload();

  /** How many objects of the form each file supplies. */
  const uses = $derived.by(() => {
    const counts = new SvelteMap<string, number>();
    const walk = (value: unknown) => {
      if (value === null || typeof value !== "object") return;
      const origin = originOf(value);
      if (origin) counts.set(origin.file, (counts.get(origin.file) ?? 0) + 1);
      Object.values(value).forEach(walk);
    };
    walk(model?.data);
    return counts;
  });

  /** The files by folder, folders first. */
  const folders = $derived.by(() => {
    const byFolder = new Map<string, string[]>();
    for (const path of paths) {
      const folder = dirname(path);
      byFolder.set(folder, [...(byFolder.get(folder) ?? []), path]);
    }
    return [...byFolder].sort(([a], [b]) =>
      a === "" ? -1 : b === "" ? 1 : a.localeCompare(b),
    );
  });

  const ObjectField = $derived(
    theme?.byKind?.object ?? defaults.component.byKind.object,
  );

  const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1);
  const target = (from: string, ref: string) => {
    const [file] = ref.split("#");
    return file ? join(from, file) : from;
  };
</script>

<div class="refs">
  <header class="intro">
    <h2>Data from many files</h2>
    <p>
      <code>shelf.json</code> names its curator and books with
      <code>{'{ "$ref": "people/ada.json" }'}</code>. Loading expands every
      reference into one document for the form; saving writes each edit back to
      the file it came from. Ada is one file used twice: edit either copy.
    </p>
  </header>

  <aside class="files" aria-label="Files">
    <h3>Files</h3>
    <ul class="tree">
      {#each folders as [folder, files] (folder)}
        <li>
          {#if folder}<span class="folder">{folder}/</span>{/if}
          <ul class:nested={folder !== ""}>
            {#each files as file (file)}
              <li>
                <button
                  type="button"
                  class="file"
                  class:selected={file === selected}
                  aria-current={file === selected ? "true" : undefined}
                  onclick={() => open(file)}
                >
                  <span class="name">{basename(file)}</span>
                  {#if file === entry}<span class="tag">entry</span>{/if}
                  {#if (uses.get(file) ?? 0) > 1}
                    <span class="tag" title="used in {uses.get(file)} places">
                      ×{uses.get(file)}
                    </span>
                  {/if}
                  {#if edited.has(file)}
                    <span class="tag edited" title="written by a save"
                      >saved</span
                    >
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>

    {#if selected}
      <section class="viewer" aria-label="Stored file">
        <header><code>{selected}</code> <span>as stored</span></header>
        <div class="json">{@render json(shown, selected)}</div>
      </section>
    {/if}
  </aside>

  <section class="form" aria-label="Assembled document">
    <div class="toolbar">
      <button type="button" class="primary" onclick={persist} disabled={saving}>
        Save to files
      </button>
      <button type="button" onclick={discard} disabled={saving}
        >Discard edits</button
      >
      <p class="status" role="status">
        {#if report}
          {#if report.conflicts.length}
            {#each report.conflicts as { file } (file)}
              <span class="conflict">
                <code>{file}</code> is used in more than one place and was edited
                differently in each: not written.
              </span>
            {/each}
          {/if}
          {#if report.written.length}
            Wrote {#each report.written as file, i (file)}{i ? ", " : ""}<code
                >{file}</code
              >{/each}.
          {:else if !report.conflicts.length}
            Nothing changed.
          {/if}
        {/if}
      </p>
    </div>

    {#if failure}
      <p class="failure" role="alert">{failure}</p>
    {:else if model}
      {#await tree then node}
        {#key model}
          <Schema root={node} {model} {theme} {object} />
        {/key}
      {/await}
    {/if}
  </section>
</div>

<!-- every object from a file: the theme's own object, badged with the file -->
{#snippet object(props: Field.Props<"object">)}
  {@const origin = originOf(props.model.get(props.node))}
  {#if origin}
    <div class="sourced" class:selected={origin.file === selected}>
      <button
        type="button"
        class="badge"
        onclick={() => open(origin.file)}
        title="show {origin.file}"
      >
        {origin.pointer ? `${origin.file}#${origin.pointer}` : origin.file}
      </button>
      <ObjectField {...props} />
    </div>
  {:else}
    <ObjectField {...props} />
  {/if}
{/snippet}

<!-- a stored document, its references links to their files -->
{#snippet json(value: unknown, file: string)}
  {#if isReference(value)}
    <span class="punct">{"{ "}</span><span class="key">"$ref"</span><span
      class="punct">{": "}</span
    ><button
      type="button"
      class="ref"
      onclick={() => open(target(file, value.$ref))}
      title="open {target(file, value.$ref)}">"{value.$ref}"</button
    ><span class="punct">{" }"}</span>
  {:else if Array.isArray(value)}
    {#if value.every((item) => item === null || typeof item !== "object")}
      <span class="punct">[</span>{#each value as item, i}{i
          ? ", "
          : ""}{@render json(item, file)}{/each}<span class="punct">]</span>
    {:else}
      <span class="punct">[</span>
      <div class="indent">
        {#each value as item, i}
          <div>{@render json(item, file)}{i < value.length - 1 ? "," : ""}</div>
        {/each}
      </div>
      <span class="punct">]</span>
    {/if}
  {:else if value !== null && typeof value === "object"}
    {@const entries = Object.entries(value)}
    <span class="punct">{"{"}</span>
    <div class="indent">
      {#each entries as [key, child], i (key)}
        <div>
          <span class="key">"{key}"</span><span class="punct">{": "}</span
          >{@render json(child, file)}{i < entries.length - 1 ? "," : ""}
        </div>
      {/each}
    </div>
    <span class="punct">{"}"}</span>
  {:else if typeof value === "string"}
    <span class="string">"{value}"</span>
  {:else}
    <span class="literal">{String(value)}</span>
  {/if}
{/snippet}

<!-- the shelf as the dev server serves it, with saves kept in memory over it -->
{#snippet bookshelf(
  DataRefs: typeof Self,
  shelf: typeof served,
  inMemoryOver: typeof overlay,
  themes: typeof allThemes,
)}
  <DataRefs fs={inMemoryOver(shelf())} theme={themes.minimal} />
{/snippet}

{#snippet resolvesEveryReferenceIntoOneForm(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  <DataRefs fs={files()} />
  {test(async ({ expect, waitFor }) => {
    const value = (path: string) =>
      document.querySelector<HTMLInputElement>(`[data-path="${path}"] input`)
        ?.value;
    await waitFor(() => expect(value("curator.name")).toBe("Ada Lovelace"));
    expect(value("books.0.author.name")).toBe("Ada Lovelace");
    expect(value("books.1.author.name")).toBe("Charles Babbage");
    expect(value("books.2.title")).toBe(
      "On the Economy of Machinery and Manufactures",
    );
  })}
{/snippet}

{#snippet badgesNameTheFileEachPartCameFrom(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  <DataRefs fs={files()} />
  {test(async ({ expect, waitFor }) => {
    const badge = (path: string) =>
      document
        .querySelector(`[data-path="${path}"] .badge`)
        ?.textContent?.trim();
    await waitFor(() => expect(badge("curator")).toBe("people/ada.json"));
    expect(badge("books.0")).toBe("books/notes.json");
    expect(badge("books.2")).toBe("catalog.json#/books/0");
  })}
{/snippet}

{#snippet savingWritesEachEditToTheFileItCameFrom(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  {@const fs = files()}
  <DataRefs {fs} />
  {test(async ({ expect, waitFor, screen, user }) => {
    const title = () =>
      document.querySelector<HTMLInputElement>(
        '[data-path="books.1.title"] input',
      )!;
    await waitFor(() => expect(title()).not.toBeNull());
    await user.clear(title());
    await user.type(title(), "Passages, revised");
    await user.click(screen.getByRole("button", { name: "Save to files" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain(
        "books/passages.json",
      ),
    );
    expect(await fs.read("books/passages.json")).toMatchObject({
      title: "Passages, revised",
      author: { $ref: "../people/charles.json" },
    });
    expect(await fs.read("shelf.json")).toMatchObject({
      books: [
        { $ref: "books/notes.json" },
        { $ref: "books/passages.json" },
        { $ref: "catalog.json#/books/0" },
      ],
    });
  })}
{/snippet}

{#snippet aFileUsedTwiceIsWrittenFromTheCopyThatChanged(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  {@const fs = files()}
  <DataRefs {fs} />
  {test(async ({ expect, waitFor, screen, user }) => {
    const name = (path: string) =>
      document.querySelector<HTMLInputElement>(
        `[data-path="${path}.name"] input`,
      )!;
    await waitFor(() => expect(name("curator")).not.toBeNull());
    await user.type(name("books.0.author"), ", Countess");
    await user.click(screen.getByRole("button", { name: "Save to files" }));
    await waitFor(() =>
      expect(name("curator").value).toBe("Ada Lovelace, Countess"),
    );
    expect(await fs.read("people/ada.json")).toMatchObject({
      name: "Ada Lovelace, Countess",
    });
  })}
{/snippet}

{#snippet copiesEditedDifferentlyAreAConflict(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  {@const fs = files()}
  <DataRefs {fs} />
  {test(async ({ expect, waitFor, screen, user }) => {
    const name = (path: string) =>
      document.querySelector<HTMLInputElement>(
        `[data-path="${path}.name"] input`,
      )!;
    await waitFor(() => expect(name("curator")).not.toBeNull());
    await user.type(name("curator"), " (curator)");
    await user.type(name("books.0.author"), " (author)");
    await user.click(screen.getByRole("button", { name: "Save to files" }));
    await waitFor(() =>
      expect(
        screen.getByRole("status").textContent?.replace(/\s+/g, " "),
      ).toContain("edited differently in each: not written"),
    );
    expect(await fs.read("people/ada.json")).toMatchObject({
      name: "Ada Lovelace",
    });
  })}
{/snippet}

{#snippet badgesAndRefsOpenTheirFile(
  DataRefs: typeof Self,
  files: typeof inMemory,
  test: Test,
)}
  <DataRefs fs={files()} />
  {test(async ({ expect, waitFor, user }) => {
    const shown = () =>
      document.querySelector(".viewer header code")?.textContent;
    await waitFor(() => expect(shown()).toBe("shelf.json"));
    await user.click(document.querySelector('[data-path="curator"] .badge')!);
    await waitFor(() => expect(shown()).toBe("people/ada.json"));
    await user.click(document.querySelector('[data-path="books.0"] .badge')!);
    await waitFor(() => expect(shown()).toBe("books/notes.json"));
    // a $ref in the stored file, relative to it
    await user.click(document.querySelector(".viewer .ref")!);
    await waitFor(() => expect(shown()).toBe("people/ada.json"));
  })}
{/snippet}

<style>
  .refs {
    --ink: #1f2933;
    --soft: #64748b;
    --line: #e2e8f0;
    --paper: #f8fafc;
    --accent: #0f766e;
    display: grid;
    grid-template-columns: minmax(16rem, 1fr) minmax(0, 1.5fr);
    grid-template-areas: "intro intro" "files form";
    gap: 1.25rem;
    color: var(--ink);
    font:
      14px/1.5 ui-sans-serif,
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif;
  }

  @media (max-width: 860px) {
    .refs {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: "intro" "form" "files";
    }
  }

  .intro {
    grid-area: intro;
  }

  .intro h2 {
    margin: 0 0 0.25rem;
    font-size: 1.35rem;
  }

  .intro p {
    margin: 0;
    max-width: 62ch;
    color: var(--soft);
  }

  code {
    font:
      0.92em ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
  }

  .files {
    grid-area: files;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    /* beside a long form, the files and the viewer stay in sight */
    position: sticky;
    top: 1rem;
    align-self: start;
    max-height: calc(100vh - 2rem);
    overflow: auto;
  }

  @media (max-width: 860px) {
    .files {
      position: static;
      max-height: none;
    }
  }

  .files h3 {
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--soft);
  }

  .tree,
  .tree ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tree ul.nested {
    padding-left: 1rem;
    border-left: 1px solid var(--line);
    margin-left: 0.35rem;
  }

  .folder {
    display: block;
    padding: 0.2rem 0.4rem;
    font:
      600 13px ui-monospace,
      monospace;
    color: var(--soft);
  }

  .file {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.25rem 0.5rem;
    font:
      13px ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
    color: inherit;
    text-align: left;
    background: none;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
  }

  .file:hover {
    background: var(--paper);
  }

  .file.selected {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .file:focus-visible,
  .badge:focus-visible,
  .ref:focus-visible,
  .toolbar button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .tag {
    padding: 0 0.4em;
    font:
      600 10px/1.6 ui-sans-serif,
      system-ui,
      sans-serif;
    letter-spacing: 0.03em;
    color: var(--soft);
    border: 1px solid var(--line);
    border-radius: 999px;
  }

  .tag.edited {
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  }

  .viewer {
    overflow: hidden;
    background: #0f172a;
    color: #e2e8f0;
    border-radius: 10px;
  }

  .viewer header {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 12px;
    color: #94a3b8;
    border-bottom: 1px solid #1e293b;
  }

  .viewer header code {
    color: #e2e8f0;
  }

  .json {
    padding: 0.75rem;
    overflow-x: auto;
    font:
      12.5px/1.6 ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
    white-space: nowrap;
  }

  .indent {
    padding-left: 1.25em;
  }

  .key {
    color: #93c5fd;
  }

  .string {
    color: #86efac;
  }

  .literal {
    color: #fca5a5;
  }

  .punct {
    color: #64748b;
    white-space: pre;
  }

  .ref {
    padding: 0;
    font: inherit;
    color: #fcd34d;
    background: none;
    border: 0;
    border-bottom: 1px dashed currentColor;
    cursor: pointer;
  }

  .form {
    grid-area: form;
    min-width: 0;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .toolbar button {
    padding: 0.45rem 0.9rem;
    font:
      600 13px ui-sans-serif,
      system-ui,
      sans-serif;
    color: var(--ink);
    background: white;
    border: 1px solid var(--line);
    border-radius: 8px;
    cursor: pointer;
  }

  .toolbar button.primary {
    color: white;
    background: var(--accent);
    border-color: var(--accent);
  }

  .toolbar button:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  .status {
    flex: 1 1 16rem;
    margin: 0;
    font-size: 13px;
    color: var(--soft);
  }

  .conflict {
    display: block;
    color: #b45309;
  }

  .failure {
    padding: 0.75rem 1rem;
    color: #991b1b;
    background: #fef2f2;
    border-radius: 8px;
  }

  .sourced {
    position: relative;
    border-radius: 10px;
    outline: 2px solid transparent;
    outline-offset: 4px;
    transition: outline-color 150ms;
  }

  .sourced.selected {
    outline-color: color-mix(in srgb, var(--accent) 55%, transparent);
  }

  .badge {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    max-width: 60%;
    overflow: hidden;
    padding: 0.1rem 0.55rem;
    font:
      11.5px/1.6 ui-monospace,
      "SF Mono",
      Menlo,
      monospace;
    color: var(--accent);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: color-mix(in srgb, var(--accent) 10%, white);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 999px;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .sourced {
      transition: none;
    }
  }
</style>
