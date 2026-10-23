import { describe, expect, it } from "vitest";

import { PROVINCE_CODES } from "../../src/lib/review-fields";
import { MAP_VIEWBOX, PROVINCE_SHAPES } from "../../src/lib/map/indonesia-provinces";
import { PROVINCE_NAMES } from "../../src/lib/map/province-names";

describe("region map data", () => {
  it("has a valid shape and a bilingual name for every province drawn", () => {
    expect(PROVINCE_SHAPES.length).toBeGreaterThanOrEqual(33);
    for (const shape of PROVINCE_SHAPES) {
      expect(PROVINCE_CODES, shape.code).toContain(shape.code);
      expect(shape.d, shape.code).toMatch(/^M[\d.\s LMZ-]+Z$/);
      expect(PROVINCE_NAMES[shape.code]?.id, shape.code).toBeTruthy();
      expect(PROVINCE_NAMES[shape.code]?.en, shape.code).toBeTruthy();
    }
  });

  it("names every code the database accepts", () => {
    for (const code of PROVINCE_CODES) expect(PROVINCE_NAMES[code], code).toBeDefined();
  });

  it("draws the provinces of the seeded regions exactly", () => {
    const drawn = new Set(PROVINCE_SHAPES.map((shape) => shape.code));
    for (const code of ["ID-JT", "ID-YO", "ID-JI", "ID-SB", "ID-SN"]) expect(drawn.has(code), code).toBe(true);
  });

  it("uses a sane viewBox", () => {
    const [, , width, height] = MAP_VIEWBOX.split(" ").map(Number);
    expect(width).toBeGreaterThan(height);
  });
});
