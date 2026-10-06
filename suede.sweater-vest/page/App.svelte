<script lang="ts">
  // A whole page for plain Vite: the list of snippets, and one of them when the
  // hash names it (`#src/lib/Button/clicks`). SvelteKit projects use the route
  // template instead, which renders `Runner` directly.
  //
  // The editor extension opens `<pagesRoute>/<key>` (`/vests/src/lib/Button/clicks`
  // by default), SvelteKit's form. A dev server that answers that path with this
  // page (Vite's fallback to index.html does) leaves the key in the path, so
  // without a hash the page looks for a snippet whose key ends the path, which
  // works whatever `pagesRoute` is.
  import { onMount } from "svelte";
  import Runner from "../runtimes/Browser.svelte";
  import { fetchTests, type VestEntry } from "../runtimes/common.svelte.ts";

  let tests = $state<VestEntry[]>([]);
  onMount(async () => (tests = await fetchTests()));

  const trim = (key: string) => decodeURIComponent(key).replace(/\/$/, "");

  // `#/` names the list, so only an absent hash falls back to the path
  const keyOf = () =>
    location.hash
      ? trim(location.hash.replace(/^#\/?/, ""))
      : { path: trim(location.pathname) };

  let key = $state(keyOf());
  const entry = $derived.by(() => {
    if (typeof key === "string")
      return tests.find((t) => t.key === key) ?? null;
    const { path } = key;
    // the longest key that ends the path, should one key end another
    return tests
      .filter((t) => path.endsWith(`/${t.key}`))
      .reduce<VestEntry | null>(
        (best, t) => (best && best.key.length >= t.key.length ? best : t),
        null,
      );
  });
  // a path that names no snippet is just where the page lives
  const missing = $derived(typeof key === "string" ? key : "");
</script>

<svelte:window onhashchange={() => (key = keyOf())} />

{#if entry}
  <nav><a href="#/">← every snippet</a></nav>
  {#key entry.key}
    <Runner {entry} />
  {/key}
{:else}
  <h1>Vests</h1>
  {#if missing}<p>No snippet at <code>{missing}</code>.</p>{/if}
  <ul>
    {#each tests as t}
      <li>
        <a href="#{t.key}">{t.name}</a>
        {#if !t.test}<em>(example)</em>{/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  nav {
    font-family: system-ui, sans-serif;
    padding: 0.5rem 1rem 0;
  }
</style>
