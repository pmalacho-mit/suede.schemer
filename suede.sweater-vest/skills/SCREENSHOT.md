---
name: screenshot
description: Take and inspect screenshots of this repo's components in headless Chromium — a snippet's page, one element of it, light and dark, at any width — and probe computed styles. Use when you need to see what a component or theme looks like (visual review, CSS work, checking dark mode or narrow layouts), not just whether its tests pass.
---

# Screenshots of components

Tests say whether a component works; only a screenshot says whether it looks right. This repo's dev server renders every sweater-vest snippet on a page of its own, so any component, in any state a snippet sets up, can be photographed in headless Chromium and then looked at with the Read tool (it shows images).

`playwright` is already installed: it comes with `suede.sweater-vest`'s dependencies. What it needs is a browser, and the browser's system libraries.

## 1. Install Chromium (once per container)

```bash
npx playwright install chromium
```

That downloads the browser to `~/.cache/ms-playwright/`. If launching it then fails with `error while loading shared libraries: libglib-2.0.so.0` (or any other `.so`), the container lacks the browser's system libraries. Install them:

```bash
sudo -n true && echo "sudo ok"                              # check sudo needs no password
sudo env "PATH=$PATH" npx playwright install-deps chromium  # apt-installs the libraries
```

`sudo` resets `PATH`, so a bare `sudo npx …` fails with `npx: command not found`; `env "PATH=$PATH"` passes yours through. This changes the container's system packages: say that you did it when you report back.

## 2. Start the dev server

Use a port of your own, so you do not collide with the user's server or another
agent's:

```bash
(npx vite --port 5199 --strictPort > /tmp/vite-5199.log 2>&1 &)
for i in $(seq 1 40); do curl -sf http://localhost:5199/ >/dev/null && break; sleep 0.5; done
```

Every snippet's page key is its component's path without `.svelte`, then the snippet's name: `release/_internal/Showcase.svelte` > `paper` is `release/_internal/Showcase/paper`. List them all from the server:

```bash
curl -s http://localhost:5199/__sweater-vest/tests.json \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s).forEach(t=>console.log(t.key)))'
```

A page is `http://localhost:5199/#<key>`. `/vests/<key>` (the editor extension's "Open page" form) works too: with no hash, the sweater-vest page opens the snippet whose key ends the path. Query parameters before the `#` reach the page, for components that read them (the `src/Examples` gallery takes `?theme=%22paper%22`).

## 3. Take screenshots

Write the scripts **inside the project**, so Node resolves `playwright` from its `node_modules` (a script in `/tmp` cannot import it). Name them `.<name>.tmp.mjs` at the root, which `.gitignore` ignores, and delete them when done.

### A whole page

`.shot.tmp.mjs`: `node .shot.tmp.mjs <url> <out.png> [width] [light|dark]`

```js
import { chromium } from "playwright";
const [url, out, width = "1000", scheme = "light"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: +width, height: 900 },
  colorScheme: scheme, // drives prefers-color-scheme
});
page.on("pageerror", (e) => console.log("pageerror", e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800); // forms build their tree in an {#await}
await page.screenshot({ path: out, fullPage: true });
await browser.close();
```

```bash
K=release/_internal/Showcase/paper
node .shot.tmp.mjs "http://localhost:5199/#$K" /tmp/shots/paper-light.png 1000 light
node .shot.tmp.mjs "http://localhost:5199/#$K" /tmp/shots/paper-dark.png 1000 dark
node .shot.tmp.mjs "http://localhost:5199/#$K" /tmp/shots/paper-narrow.png 400 light
```

### One element, at full resolution

A tall page is scaled down when you read it, and detail is lost. To review one
part closely, photograph just that element: `locator(selector).screenshot()`.
Fields carry `data-path`, `data-kind`, `data-action` and `data-role`; a theme's
container carries `data-theme` and `data-mode`.

```js
const el = page.locator('[data-theme] [data-path="address"]').first();
await el.screenshot({ path: out });
```

To look at states, act first: `await page.hover(sel)`, `await page.focus(sel)`,
`await page.click(sel)`, `await page.selectOption(sel, "Invoice")`, then shoot.

### Many shots side by side

There is no image library to stitch PNGs, but Chromium can. Write an HTML page
that lays them out (a `<table>` of `<img src="…png">`, beside the PNGs), then
photograph that page from a `file://` URL:

```js
await page.goto("file:///tmp/shots/sheet.html");
await page.screenshot({ path: "/tmp/shots/sheet.png", fullPage: true });
```

One sheet of (say) every theme in light and dark is the quickest way to compare
them.

### Ask the page instead of looking

When the question is about a value ("is this switch drawn checked?", "which rule
wins?"), evaluate it rather than squinting at pixels:

```js
console.log(
  await page.evaluate(() =>
    [...document.querySelectorAll("[data-theme]")].map((t) => {
      const c = t.querySelector('[data-path="workshop"] input');
      return {
        mode: t.dataset.mode,
        checked: c.checked,
        bg: getComputedStyle(c).backgroundColor,
      };
    }),
  ),
);
```

## 4. Look, and iterate

Read each PNG with the Read tool. Check alignment and spacing rhythm, nested
groups, array items, read-only (view) mode, dark mode, and a narrow width
(around 400px). Change the CSS and shoot again: the dev server hot-reloads, so
only the screenshot needs rerunning.

## 5. Clean up

```bash
pkill -f "vite --port 5199"
rm -f .*.tmp.mjs
```

Run `pkill` as a command of its own: it also matches the shell that runs it, so
anything chained after it in the same command does not run (exit code 144).

## Pitfalls

- **A blank or half-drawn page**: the form had not resolved yet. Keep
  `networkidle` plus a short wait, or wait for a selector
  (`await page.waitForSelector("[data-theme]")`).
- **A component renders as nothing after an edit**: Vite can cache a file
  caught mid-write (a formatter saving it, say). `touch` the file and reload.
- **Fonts**: only the container's fonts exist. A theme that names a font the
  container lacks (Arial Black, Roboto) falls back; judge the layout, not the
  exact face.
