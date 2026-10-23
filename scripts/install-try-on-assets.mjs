import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

// Generated costume atlases contain three detached garments, not three photos.
// Split only in their transparent gutters; preserve their alpha and artwork.
const jobs = JSON.parse(await readFile("tmp/try-on/jobs.json", "utf8"));
await mkdir("public/try-on/costumes", { recursive: true });
const records = [];
for (const job of jobs) {
  if (job.parts) {
    for (const [part, item] of Object.entries(job.parts)) {
      await sharp(item.path).trim({ background: "#00000000", threshold: 12 }).resize({ width: 720, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/try-on/costumes/${job.slug}-${part}.webp`);
    }
    records.push({ slug: job.slug, prompts: Object.fromEntries(Object.entries(job.parts).map(([part, item]) => [part, item.prompt])), tool: "OpenAI built-in image_gen", transparent_background: true });
    console.log(job.slug, "individual parts");
    continue;
  }
  const { data, info } = await sharp(job.path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const projection = Array(info.width).fill(0);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 24) projection[x]++;
  const split = (start, end, ideal) => {
    let best = Math.floor(info.width * ideal), score = Infinity;
    for (let x = Math.floor(info.width * start); x < info.width * end; x++) {
      const value = projection[x] * 1000 + Math.abs(x - info.width * ideal);
      if (value < score) { best = x; score = value; }
    }
    if (projection[best] > 8) throw new Error(`${job.slug}: garments touch at x=${best}; inspect atlas instead of cutting artwork`);
    return best;
  };
  const cuts = [0, split(0.20, 0.46, 1 / 3), split(0.55, 0.82, 2 / 3), info.width];
  for (const [index, part] of ["head", "top", "bottom"].entries()) {
    const tile = await sharp(job.path).extract({ left: cuts[index], top: 0, width: cuts[index + 1] - cuts[index], height: info.height }).png().toBuffer();
    const buffer = await sharp(tile).trim({ background: "#00000000", threshold: 12 }).resize({ width: 720, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toBuffer();
    await writeFile(`public/try-on/costumes/${job.slug}-${part}.webp`, buffer);
  }
  records.push({ slug: job.slug, prompt: job.prompt, tool: "OpenAI built-in image_gen", transparent_background: true, cuts });
  console.log(job.slug, cuts);
}
await writeFile("docs/try-on-prompts.json", JSON.stringify(records, null, 2) + "\n");
