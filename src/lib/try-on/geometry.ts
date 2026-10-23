export type Point = { x: number; y: number; visibility?: number };
export type Part = "head" | "top" | "bottom";
export type Box = { x: number; y: number; width: number; height: number };
export type Adjustment = { size: number; x: number; y: number; rotation: number };
export const DEFAULT_ADJUSTMENT: Adjustment = { size: 100, x: 0, y: 0, rotation: 0 };

/** Match CSS object-fit:cover so landmarks and exported photos share coordinates. */
export function coverCrop(width: number, height: number, targetWidth: number, targetHeight: number) {
  const scale = Math.max(targetWidth / width, targetHeight / height);
  return { scale, x: (targetWidth - width * scale) / 2, y: (targetHeight - height * scale) / 2 };
}

export function projectPose(points: Point[], width: number, height: number, stageWidth: number, stageHeight: number, mirror: boolean): Point[] {
  const crop = coverCrop(width, height, stageWidth, stageHeight);
  return points.map((p) => {
    const x = p.x * width * crop.scale + crop.x;
    return { ...p, x: mirror ? stageWidth - x : x, y: p.y * height * crop.scale + crop.y };
  });
}

/** Garment bounds follow shoulders/hips; unseen lower legs use torso proportions. */
export function poseBoxes(points: Point[]): Record<Part, Box> | null {
  const [a, b, c, d] = [points[11], points[12], points[23], points[24]];
  if (!a || !b || !c || !d || [a, b, c, d].some((p) => (p.visibility ?? 1) < 0.45)) return null;
  const sx = (a.x + b.x) / 2, sy = (a.y + b.y) / 2;
  const hx = (c.x + d.x) / 2, hy = (c.y + d.y) / 2;
  const shoulder = Math.hypot(a.x - b.x, a.y - b.y);
  const torso = Math.max(hy - sy, shoulder * 0.9);
  if (shoulder < 10 || torso < 15) return null;
  const earA = points[7], earB = points[8], nose = points[0];
  const headWidth = Math.max(shoulder * 0.7, earA && earB ? Math.abs(earA.x - earB.x) * 1.4 : 0);
  const ankles = [points[27], points[28]].filter((p) => p && (p.visibility ?? 0) > 0.55);
  const bottom = ankles.length ? Math.max(...ankles.map((p) => p.y)) : hy + torso * 1.8;
  return {
    head: { x: (nose?.x ?? sx) - headWidth / 2, y: (nose?.y ?? sy - torso * 0.65) - headWidth * 1.05, width: headWidth, height: headWidth * 0.85 },
    top: { x: sx - shoulder * 0.85, y: sy - torso * 0.15, width: shoulder * 1.7, height: torso * 1.25 },
    bottom: { x: hx - shoulder * 0.64, y: hy - torso * 0.12, width: shoulder * 1.28, height: Math.max(bottom - hy, torso) + torso * 0.15 },
  };
}

export function manualBoxes(width: number, height: number, index: number, couple: boolean): Record<Part, Box> {
  const body = width * (couple ? 0.38 : 0.65);
  const cx = width * (couple ? index === 0 ? 0.27 : 0.73 : 0.5);
  return {
    head: { x: cx - body * 0.24, y: height * 0.04, width: body * 0.48, height: height * 0.16 },
    top: { x: cx - body / 2, y: height * 0.24, width: body, height: height * 0.34 },
    bottom: { x: cx - body * 0.39, y: height * 0.55, width: body * 0.78, height: height * 0.44 },
  };
}

export function adjustedBox(box: Box, adjustment: Adjustment, width: number, height: number): Box {
  const scale = adjustment.size / 100;
  return { x: box.x + box.width * (1 - scale) / 2 + adjustment.x / 100 * width, y: box.y + box.height * (1 - scale) / 2 + adjustment.y / 100 * height, width: box.width * scale, height: box.height * scale };
}
