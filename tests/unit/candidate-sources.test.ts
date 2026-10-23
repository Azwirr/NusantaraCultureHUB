import { describe, expect, it } from "vitest";

import { CANDIDATE_SOURCES, candidateSourcesFor } from "../../src/lib/candidate-sources";
import { isReviewEntityType } from "../../src/lib/review-types";

describe("candidate sources", () => {
  it("are keyed by a real review type and slug", () => {
    for (const key of Object.keys(CANDIDATE_SOURCES)) {
      const [type, slug] = key.split(":");
      expect(isReviewEntityType(type), key).toBe(true);
      expect(slug, key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("are https pages with a title, a credit and notes in both languages", () => {
    for (const [key, list] of Object.entries(CANDIDATE_SOURCES)) {
      for (const source of list) {
        expect(source.url, key).toMatch(/^https:\/\/[^\s]+$/);
        expect(source.title.trim(), key).not.toBe("");
        expect(source.credit.trim(), key).not.toBe("");
        expect(source.covers.id.trim(), key).not.toBe("");
        expect(source.covers.en.trim(), key).not.toBe("");
        // Fits the sources table (title 300, url 2048, credit 300).
        expect(source.title.length, key).toBeLessThanOrEqual(300);
        expect(source.credit.length, key).toBeLessThanOrEqual(300);
      }
    }
  });

  it("returns nothing for unknown items", () => {
    expect(candidateSourcesFor("recipe", "not-a-recipe")).toEqual([]);
    expect(candidateSourcesFor("recipe", undefined)).toEqual([]);
    expect(candidateSourcesFor("recipe", "rendang-daging").length).toBeGreaterThan(0);
  });
});
