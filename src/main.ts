import { mount } from "svelte";
import App from "../suede.sweater-vest/page/App.svelte";

// The editor extension's "Open page" goes to `/vests/<component>/<snippet>`
// (its `pagesRoute`, SvelteKit's route), but this page names a snippet by its
// hash (`/#<component>/<snippet>`): move a path under /vests into the hash.
const route = /^\/vests(?:\/(.*))?$/.exec(location.pathname);
if (route)
  history.replaceState(null, "", `/${location.search}#${route[1] ?? ""}`);

export default mount(App, { target: document.getElementById("app")! });
