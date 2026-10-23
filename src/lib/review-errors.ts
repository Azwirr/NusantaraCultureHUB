// Turns database refusals from the review gate into message codes that the
// review queue shows in both languages. Client-safe: no server imports.
//
// The messages matched here are the ones raised by guard_approval,
// assert_publishable, review_content and guard_user_roles (migrations 1-8).

export type ReviewErrorCode =
  | "own_work"
  | "forbidden"
  | "missing_fields"
  | "region_not_approved"
  | "needs_source"
  | "no_chapters"
  | "chapter_accessibility"
  | "chapters_not_approved"
  | "recipe_basics"
  | "recipe_children"
  | "recipe_bilingual"
  | "locked"
  | "reason_required"
  | "already"
  | "invalid_transition"
  | "last_owner"
  | "duplicate"
  | "not_found"
  | "nickname_not_found"
  | "invalid_input"
  | "unknown";

export type ReviewError = { code: ReviewErrorCode; fields?: string[] };

type DbError = { code?: string | null; message?: string | null } | null | undefined;

export function mapReviewError(error: DbError): ReviewError {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (code === "P0002") return { code: "not_found" };
  if (code === "23505") return { code: "duplicate" };
  if (code === "42501") {
    return message.includes("cannot approve content you created") ? { code: "own_work" } : { code: "forbidden" };
  }
  if (code === "23503") return { code: "not_found" };
  if (code === "22023" || code === "22P02") return { code: "invalid_input" };

  if (code === "23514") {
    const missing = /: missing (.+)$/.exec(message);
    if (missing) return { code: "missing_fields", fields: missing[1].split(", ").filter(Boolean) };
    if (message.includes("region must be approved first")) return { code: "region_not_approved" };
    if (message.includes("cite at least one source")) return { code: "needs_source" };
    if (message.includes("it has no chapters")) return { code: "no_chapters" };
    if (message.includes("alt text and an audio description")) return { code: "chapter_accessibility" };
    if (message.includes("approve every chapter first")) return { code: "chapters_not_approved" };
    if (message.includes("servings and minutes")) return { code: "recipe_basics" };
    if (message.includes("needs ingredients and steps")) return { code: "recipe_children" };
    if (message.includes("ingredient and step needs both languages")) return { code: "recipe_bilingual" };
    if (message.includes("locked")) return { code: "locked" };
    if (message.includes("reason is required")) return { code: "reason_required" };
    if (message.includes("content is already")) return { code: "already" };
    if (message.includes("last owner")) return { code: "last_owner" };
    if (/cannot (approve|move)|can be (rejected|unpublished)/.test(message)) return { code: "invalid_transition" };
    return { code: "invalid_input" };
  }
  return { code: "unknown" };
}
