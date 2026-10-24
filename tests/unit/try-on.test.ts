import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { COSTUME_SLUGS, costumeParts } from "../../src/lib/try-on/assets";
import { adjustedBox, coverCrop, DEFAULT_ADJUSTMENT, manualBoxes, poseBoxes, projectPose } from "../../src/lib/try-on/geometry";

describe("on-device try-on composition", () => {
  it("projects body landmarks into the same mirrored crop used by export", () => {
    expect(coverCrop(1280, 720, 750, 1000)).toEqual({ scale: 1000 / 720, x: (750 - 1280 * 1000 / 720) / 2, y: 0 });
    const p = [{ x: 0.3, y: 0.4, visibility: 1 }];
    const plain = projectPose(p, 1280, 720, 750, 1000, false)[0];
    const mirror = projectPose(p, 1280, 720, 750, 1000, true)[0];
    expect(plain.x + mirror.x).toBeCloseTo(750); expect(plain.y).toBeCloseTo(400);
  });
  it("rejects invisible bodies and keeps separate manual positions for two people", () => {
    expect(poseBoxes([])).toBeNull();
    const left = manualBoxes(750, 1000, 0, true), right = manualBoxes(750, 1000, 1, true);
    expect(left.top.x + left.top.width).toBeLessThan(right.top.x);
    expect(adjustedBox(left.top, DEFAULT_ADJUSTMENT, 750, 1000)).toEqual(left.top);
    expect(adjustedBox(left.top, { ...DEFAULT_ADJUSTMENT, x: 10 }, 750, 1000).x).toBe(left.top.x + 75);
  });
  it("ships 45 transparent garment parts with no remote image dependency", async () => {
    expect(COSTUME_SLUGS).toHaveLength(15);
    for (const slug of COSTUME_SLUGS) for (const path of Object.values(costumeParts(slug)!)) {
      const bytes = readFileSync(`public${path}`);
      expect(bytes.length).toBeLessThan(1_000_000);
      const stats = await sharp(bytes).stats(), metadata = await sharp(bytes).metadata();
      expect(metadata.hasAlpha, path).toBe(true);
      expect(stats.channels[3].min, path).toBe(0);
      expect(stats.channels[3].max, path).toBeGreaterThan(200);
    }
    expect(costumeParts("unpublished-unknown")).toBeNull();
  }, 30_000);
});
