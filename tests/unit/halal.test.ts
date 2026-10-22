import { describe, expect, it } from "vitest";

import { canShowHalalBadge } from "../../src/lib/halal";

// PRD acceptance check 11: no halal label unless halal_status is verified_by_source.
describe("canShowHalalBadge", () => {
  it("allows the badge only for verified_by_source", () => {
    expect(canShowHalalBadge("verified_by_source")).toBe(true);
  });

  it.each([
    "unknown",
    "unverified_claim",
    "contains_non_halal",
    "halal",
    "verified",
    "VERIFIED_BY_SOURCE",
    "Verified_By_Source",
    " verified_by_source",
    "verified_by_source ",
    "",
  ])("hides the badge for the string %j", (status) => {
    expect(canShowHalalBadge(status)).toBe(false);
  });

  it.each([null, undefined, true, 1, 0, {}, ["verified_by_source"], { status: "verified_by_source" }])(
    "hides the badge for the non-string value %j",
    (status) => {
      expect(canShowHalalBadge(status)).toBe(false);
    },
  );
});
