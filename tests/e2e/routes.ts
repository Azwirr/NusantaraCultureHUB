/** Every page route from the build plan, plus the extra /regions index. */
export const PAGE_ROUTES = [
  "/",
  "/library",
  "/regions",
  "/regions/jawa",
  "/stories/timun-mas",
  "/recipes/rendang-daging",
  "/try-on",
  "/me",
  "/login",
  "/signup",
  "/review",
] as const;

export const REVIEW_TYPES = ["region", "story", "chapter", "recipe", "costume"] as const;
export const REVIEW_ACTIONS = ["approve", "reject", "unpublish"] as const;

/** A syntactically valid id; it does not need to exist for auth checks. */
export const SAMPLE_ID = "00000000-0000-4000-8000-000000000001";
