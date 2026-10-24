// Small, client-safe text helpers for dictionary templates.

/** Fills "{name}" placeholders: fill("{n} menit", { n: 40 }) -> "40 menit". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Public URL path of a content item. */
export function contentHref(type: "story" | "recipe" | "costume" | "ceremony", slug: string): string {
  const base = { story: "/stories", recipe: "/recipes", costume: "/costumes", ceremony: "/ceremonies" }[type];
  return `${base}/${encodeURIComponent(slug)}`;
}

const COMMONS_FILE = "https://commons.wikimedia.org/wiki/Special:FilePath/";

/**
 * A Wikimedia Commons picture at a given width. Commons originals are often
 * several MB; Special:FilePath serves a scaled copy for ?width=. Other URLs
 * (our own /placeholders, illustrations) are returned unchanged.
 */
export function sizedImage(url: string, width: number): string {
  if (!url.startsWith(COMMONS_FILE) || url.includes("?")) return url;
  return `${url}?width=${width}`;
}
