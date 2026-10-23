// Small, client-safe text helpers for dictionary templates.

/** Fills "{name}" placeholders: fill("{n} menit", { n: 40 }) -> "40 menit". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Public URL path of a content item. */
export function contentHref(type: "story" | "recipe" | "costume", slug: string): string {
  const base = type === "story" ? "/stories" : type === "recipe" ? "/recipes" : "/costumes";
  return `${base}/${encodeURIComponent(slug)}`;
}
