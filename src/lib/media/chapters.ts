import records from "./chapters.json";
import type { Locale } from "../i18n/config";
type Record = { slug: string; number: number; url: string; alt_id: string; alt_en: string; credit: string; licence: string };
const registry: Record[] = records;

/** Resolve only after the story/chapter has been loaded through RLS. */
export function chapterIllustration(slug: string, number: number, locale: Locale) {
  const row = registry.find((item) => item.slug === slug && item.number === number);
  return row ? { url: row.url, alt: locale === "en" ? row.alt_en : row.alt_id, credit: row.credit, licence: row.licence } : null;
}
