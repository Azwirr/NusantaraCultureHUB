/** Every page route from the build plan, plus the Phase 2 pages. */
export const PAGE_ROUTES = [
  "/",
  "/library",
  "/regions",
  "/regions/jawa",
  "/regions/island/jawa",
  "/stories/timun-mas",
  "/recipes/rendang-daging",
  "/costumes/baju-bodo",
  "/try-on",
  "/me",
  "/me/settings",
  "/requests",
  "/search?q=rendang",
  "/login",
  "/signup",
  "/review",
] as const;

export const REVIEW_TYPES = ["region", "story", "chapter", "recipe", "costume"] as const;
export const REVIEW_ACTIONS = ["approve", "reject", "unpublish"] as const;

/** A syntactically valid id; it does not need to exist for auth checks. */
export const SAMPLE_ID = "00000000-0000-4000-8000-000000000001";
