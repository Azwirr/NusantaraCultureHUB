import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import covers from "../../src/lib/media/covers.json";
import { localCover } from "../../src/lib/media/covers";

describe("library cover assets", () => {
  it("ships every catalog image as an actual WebP with bilingual descriptions", () => {
    expect(covers).toHaveLength(53);
    expect(new Set(covers.map((cover) => `${cover.type}:${cover.slug}`)).size).toBe(covers.length);
    for (const cover of covers) {
      expect(cover.url).toMatch(/^\/covers\/[a-z0-9-]+\.webp$/);
      expect(cover.alt_id.length).toBeGreaterThan(10);
      expect(cover.alt_en.length).toBeGreaterThan(10);
      const path = `public${cover.url}`;
      expect(existsSync(path), path).toBe(true);
      const bytes = readFileSync(path);
      expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
      expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
      expect(bytes.length).toBeLessThan(800_000);
    }
  });

  it("keeps attribution and a licence link for photos, and labels AI illustrations", () => {
    for (const cover of covers) {
      expect(cover.credit).toBeTruthy();
      if (cover.kind === "picture") {
        expect(cover.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\//);
        expect(cover.licence).toMatch(/^CC/);
        expect(cover.licenceUrl).toMatch(/^https?:\/\//);
      } else {
        expect(cover.kind).toBe("illustration");
        expect(cover.licence).toContain("AI illustration");
        expect(cover.alt_id).toContain("AI");
        expect(cover.alt_en).toContain("AI");
      }
    }
  });

  it("resolves the chosen language and returns nothing for an unknown item", () => {
    const item = covers[0];
    expect(localCover(item.type, item.slug, "id")?.alt).toBe(item.alt_id);
    expect(localCover(item.type, item.slug, "en")?.alt).toBe(item.alt_en);
    expect(localCover("story", "e2e-uji", "en")).toBeNull();
  });
});
