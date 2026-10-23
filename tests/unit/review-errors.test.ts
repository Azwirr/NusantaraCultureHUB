import { describe, expect, it } from "vitest";

import { mapReviewError } from "../../src/lib/review-errors";

describe("mapReviewError", () => {
  it("explains the four-eyes refusal", () => {
    expect(
      mapReviewError({ code: "42501", message: "you cannot approve content you created or last edited" }),
    ).toEqual({ code: "own_work" });
    expect(mapReviewError({ code: "42501", message: "only a reviewer or owner can change review_status" })).toEqual({
      code: "forbidden",
    });
  });

  it("lists the missing fields", () => {
    expect(mapReviewError({ code: "23514", message: "cannot approve regions: missing summary_id, summary_en" })).toEqual({
      code: "missing_fields",
      fields: ["summary_id", "summary_en"],
    });
  });

  it("maps approval preconditions", () => {
    const cases: Array<[string, string]> = [
      ["cannot approve stories: its region must be approved first", "region_not_approved"],
      ["cannot approve recipes: cite at least one source", "needs_source"],
      ["cannot approve story: approve every chapter first", "chapters_not_approved"],
      ["cannot approve story: every chapter needs alt text and an audio description", "chapter_accessibility"],
      ["approved regions rows are locked; unpublish before editing", "locked"],
      ["a reason is required to reject", "reason_required"],
      ["content is already approved", "already"],
      ["cannot remove the last owner", "last_owner"],
      ["only drafts can be rejected", "invalid_transition"],
    ];
    for (const [message, code] of cases) expect(mapReviewError({ code: "23514", message }).code, message).toBe(code);
  });

  it("falls back safely", () => {
    expect(mapReviewError({ code: "P0002", message: "content not found" })).toEqual({ code: "not_found" });
    expect(mapReviewError({ code: "XX000", message: "boom" })).toEqual({ code: "unknown" });
    expect(mapReviewError(null)).toEqual({ code: "unknown" });
  });
});
