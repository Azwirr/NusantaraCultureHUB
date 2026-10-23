import { describe, expect, it } from "vitest";

import { PROVINCE_CODES } from "../../src/lib/review-fields";
import { MAP_VIEWBOX, PROVINCE_SHAPES } from "../../src/lib/map/indonesia-provinces";
import { getIsland, islandOf, ISLANDS, onIsland } from "../../src/lib/map/islands";
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

describe("islands", () => {
  it("put every drawn province on exactly one island", () => {
    for (const shape of PROVINCE_SHAPES) {
      const owners = ISLANDS.filter((island) => island.provinces.includes(shape.code));
      expect(owners.length, shape.code).toBe(1);
    }
  });

  it("cover every province code the database accepts", () => {
    for (const code of PROVINCE_CODES) expect(islandOf(code), code).toBeDefined();
  });

  it("have unique slugs, both names and a label inside the map", () => {
    const [, , width, height] = MAP_VIEWBOX.split(" ").map(Number);
    expect(new Set(ISLANDS.map((island) => island.slug)).size).toBe(ISLANDS.length);
    for (const island of ISLANDS) {
      expect(island.name.id && island.name.en && island.note.id && island.note.en, island.slug).toBeTruthy();
      expect(island.label.x).toBeGreaterThan(0);
      expect(island.label.x).toBeLessThan(width);
      expect(island.label.y).toBeGreaterThan(0);
      expect(island.label.y).toBeLessThan(height);
      expect(getIsland(island.slug)).toBe(island);
    }
    expect(getIsland("atlantis")).toBeUndefined();
  });

  it("place a region on an island when any of its provinces is there", () => {
    const papua = getIsland("papua")!;
    expect(onIsland(papua, ["ID-PT"])).toBe(true);
    expect(onIsland(papua, ["ID-MA"])).toBe(false);
  });
});
