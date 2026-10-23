import "server-only";

import { cache } from "react";

import { getSessionUser } from "./auth";
import { type ContentCard, getLibrary, type PublicType } from "./content";
import type { Locale } from "./i18n/config";
import { createClient } from "./supabase/server";

export type SavedItem = { card: ContentCard; savedAt: string };

/** "recipe:<id>" keys of the member's saves, read once per request. RLS: own rows, public content only. */
export const getSavedKeys = cache(async (): Promise<Set<string> | null> => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookmarks").select("content_type, content_id");
  if (error) throw new Error(`bookmarks: ${error.message}`);
  return new Set(data.map((row) => `${row.content_type}:${row.content_id}`));
});

/**
 * The member's saved items, newest first, as library cards. Items that were
 * unpublished after saving are hidden by RLS (and missing from the library),
 * not deleted, so they come back if they are approved again.
 */
export async function getSavedItems(locale: Locale): Promise<SavedItem[]> {
  const supabase = await createClient();
  const [{ data, error }, library] = await Promise.all([
    supabase.from("bookmarks").select("content_type, content_id, created_at").order("created_at", { ascending: false }),
    getLibrary(locale),
  ]);
  if (error) throw new Error(`bookmarks: ${error.message}`);
  const byKey = new Map(library.map((card) => [`${card.type}:${card.id}`, card]));
  return data.flatMap((row) => {
    const card = byKey.get(`${row.content_type}:${row.content_id}`);
    return card ? [{ card, savedAt: row.created_at }] : [];
  });
}

export function countSaved(items: SavedItem[]): Record<PublicType, number> {
  const counts: Record<PublicType, number> = { story: 0, recipe: 0, costume: 0 };
  for (const item of items) counts[item.card.type] += 1;
  return counts;
}
