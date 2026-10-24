import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import chapters from "../../src/lib/media/chapters.json";
import { chapterIllustration } from "../../src/lib/media/chapters";

describe("chapter scene assets", () => {
  it("ships a distinct credited illustration for all 53 published chapters", () => {
    expect(chapters).toHaveLength(53);
    expect(new Set(chapters.map(r => `${r.slug}:${r.number}`)).size).toBe(53);
    expect(new Set(chapters.map(r => r.url)).size).toBe(53);
    for (const row of chapters) {
      expect(row.url).toMatch(/^\/illustrations\/[a-z0-9-]+\/chapter-\d+\.webp$/);
      const bytes = readFileSync(`public${row.url}`);
      expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
      expect(bytes.length).toBeLessThan(800_000);
      expect(row.alt_id).toContain("AI"); expect(row.alt_en).toContain("AI");
      expect(chapterIllustration(row.slug, row.number, "id")?.alt).toBe(row.alt_id);
      expect(chapterIllustration(row.slug, row.number, "en")?.licence).toContain("AI illustration");
    }
    expect(chapterIllustration("e2e-uji", 1, "id")).toBeNull();
  });
});
