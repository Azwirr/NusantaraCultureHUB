import { describe, expect, it } from "vitest";

import { safeNextPath } from "../../src/lib/safe-redirect";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/me")).toBe("/me");
    expect(safeNextPath("/review?status=draft")).toBe("/review?status=draft");
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "me",
    "/me\nSet-Cookie: x=1",
    "",
  ])("falls back for %j", (value) => {
    expect(safeNextPath(value)).toBe("/me");
  });

  it("falls back for non-strings and very long paths", () => {
    expect(safeNextPath(null)).toBe("/me");
    expect(safeNextPath(undefined, "/")).toBe("/");
    expect(safeNextPath(`/${"a".repeat(600)}`)).toBe("/me");
  });
});
