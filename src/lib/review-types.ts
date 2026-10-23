// Review vocabulary shared by server code, client forms and the dictionaries.
// Client-safe: no server imports.

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

export const REVIEW_STATUSES: readonly ReviewStatus[] = ["draft", "approved", "rejected", "unpublished"];

/** content_sources.content_type for each review type. */
export const CITATION_TYPES: Record<ReviewEntityType, string> = {
  region: "region",
  story: "story",
  chapter: "story_chapter",
  recipe: "recipe",
  costume: "costume",
};

export function isReviewEntityType(value: unknown): value is ReviewEntityType {
  return typeof value === "string" && Object.hasOwn(REVIEW_ENTITIES, value);
}

export function isReviewAction(value: unknown): value is ReviewAction {
  return value === "approve" || value === "reject" || value === "unpublish";
}

export function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === "string" && (REVIEW_STATUSES as readonly string[]).includes(value);
}

/** The actions a reviewer may try from a given status (the database decides for real). */
export function availableActions(status: ReviewStatus): ReviewAction[] {
  switch (status) {
    case "draft":
      return ["approve", "reject"];
    case "approved":
      return ["unpublish"];
    case "unpublished":
      return ["approve"];
    case "rejected":
      return [];
  }
}
