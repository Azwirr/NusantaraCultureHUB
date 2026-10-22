import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Content types the review API accepts, mapped to their tables. The URL
 * segment is never interpolated into SQL; only these table names are.
 */
export const REVIEW_ENTITIES = {
  region: "regions",
  story: "stories",
  chapter: "story_chapters",
  recipe: "recipes",
  costume: "costumes",
} as const;

export type ReviewEntityType = keyof typeof REVIEW_ENTITIES;
export type ReviewAction = "approve" | "reject" | "unpublish";
export type ReviewStatus = "draft" | "approved" | "rejected" | "unpublished";

export function isReviewEntityType(value: string): value is ReviewEntityType {
  return Object.hasOwn(REVIEW_ENTITIES, value);
}

export function isReviewAction(value: string): value is ReviewAction {
  return value === "approve" || value === "reject" || value === "unpublish";
}

export type DraftCounts = Record<ReviewEntityType, number>;

/**
 * Counts drafts per content type as the current user. Staff see real
 * numbers; anyone else sees zeros because RLS hides drafts from them.
 */
export async function getDraftCounts(): Promise<DraftCounts> {
  const supabase = await createClient();
  const entries = await Promise.all(
    (Object.keys(REVIEW_ENTITIES) as ReviewEntityType[]).map(async (type) => {
      const { count } = await supabase
        .from(REVIEW_ENTITIES[type])
        .select("id", { count: "exact", head: true })
        .eq("review_status", "draft");
      return [type, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(entries) as DraftCounts;
}
