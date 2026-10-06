// Helpers for MadLibs.svelte's snippet tests, which import this module only as a type.

/** The story's text as a reader sees it: without the hover tags that say each word's part of speech. */
export const prose = (page: Element) => {
  const copy = page.cloneNode(true) as Element;
  for (const tag of copy.querySelectorAll('[role="tooltip"]')) tag.remove();
  return (copy.textContent ?? "").replace(/\s+/g, " ");
};
