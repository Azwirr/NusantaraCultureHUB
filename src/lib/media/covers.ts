import records from "./covers.json";
import type { Locale } from "../i18n/config";

export type Cover = {
  url: string;
  alt: string;
  credit: string;
  licence: string;
  kind: "picture" | "illustration";
  sourceUrl?: string;
  licenceUrl?: string;
  objectPosition?: string;
};

/** Local covers are presentation assets, resolved only after RLS loaded the item. */
export function localCover(type: string, slug: string, locale: Locale): Cover | null {
  const row = records.find((item) => item.type === type && item.slug === slug);
  if (!row) return null;
  return {
    url: row.url,
    alt: locale === "en" ? row.alt_en : row.alt_id,
    credit: row.credit,
    licence: row.licence,
    kind: row.kind === "illustration" ? "illustration" : "picture",
    sourceUrl: row.sourceUrl,
    licenceUrl: row.licenceUrl,
    objectPosition: row.objectPosition,
  };
}
