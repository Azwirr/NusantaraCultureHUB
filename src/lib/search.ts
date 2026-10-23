import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CONTENT_TAG } from "./content-tags";
import { contentHref } from "./format";
import type { Locale } from "./i18n/config";
import { createPublicClient } from "./supabase/public";

export type SearchType = "story" | "recipe" | "costume" | "region";

export type SearchHit = {
  type: SearchType;
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  regionName: string | null;
  href: string;
};

export const SEARCH_GROUPS: SearchType[] = ["story", "recipe", "costume", "region"];

/** The query as the database will see it: trimmed, single-spaced, at most 100 characters. */
export function normalizeQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 100);
}

function isSearchType(value: string): value is SearchType {
  return (SEARCH_GROUPS as string[]).includes(value);
}

/**
 * FR-14 search over approved content, as a guest. search_content never
 * returns drafts for anyone. Cached per query and language, and expired with
 * the rest of the public content when a reviewer changes what is public.
 */
export async function searchContent(query: string, locale: Locale, limit = 20): Promise<SearchHit[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CONTENT_TAG);
  const q = normalizeQuery(query);
  if (q.length < 2) return [];
  const { data, error } = await createPublicClient().rpc("search_content", {
    p_query: q,
    p_locale: locale,
    p_limit: limit,
  });
  if (error) throw new Error(`search: ${error.message}`);
  return data.flatMap((row) =>
    isSearchType(row.content_type)
      ? [{
          type: row.content_type,
          id: row.id,
          slug: row.slug,
          title: row.title,
          summary: row.summary,
          regionName: row.region_name,
          href: row.content_type === "region" ? `/regions/${encodeURIComponent(row.slug)}` : contentHref(row.content_type, row.slug),
        }]
      : [],
  );
}

export function groupHits(hits: SearchHit[]): Array<{ type: SearchType; hits: SearchHit[] }> {
  return SEARCH_GROUPS.map((type) => ({ type, hits: hits.filter((hit) => hit.type === type) })).filter(
    (group) => group.hits.length > 0,
  );
}
