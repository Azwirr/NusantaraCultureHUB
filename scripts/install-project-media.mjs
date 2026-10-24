import { readFile, writeFile, readdir, mkdir, copyFile } from "node:fs/promises";
import sharp from "sharp";

const readJson = async (file, fallback = []) => JSON.parse(await readFile(file, "utf8").catch(() => JSON.stringify(fallback)));
const covers = await readJson("src/lib/media/covers.json");
const chapters = await readJson("src/lib/media/chapters.json");
const records = await Promise.all((await readdir("tmp/media/results")).filter((file) => file.endsWith(".json")).map((file) => readJson(`tmp/media/results/${file}`)));
const upsert = (list, row, key) => { const index = list.findIndex((item) => key(item) === key(row)); if (index < 0) list.push(row); else list[index] = row; };
const credit = "Nusantara Culture Hub · OpenAI", licence = "Ilustrasi AI / AI illustration";
await Promise.all([mkdir("public/covers", { recursive: true }), mkdir("public/illustrations", { recursive: true }), mkdir("public/try-on/costumes", { recursive: true })]);
const failures = [];
for (const record of records) {
  if (record.kind === "atlas") {
    const { data, info } = await sharp(record.path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const counts = Array(info.width).fill(0);
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 24) counts[x]++;
    const cut = (start, end, ideal) => {
      let best = 0, score = Infinity;
      for (let x = Math.floor(info.width * start); x < info.width * end; x++) { const value = counts[x] * 1000 + Math.abs(x - info.width * ideal); if (value < score) { score = value; best = x; } }
      if (counts[best] > 8) throw new Error(`No transparent gutter at ${best}`);
      return best;
    };
    try {
      const cuts = [0, cut(0.2, 0.46, 1 / 3), cut(0.55, 0.82, 2 / 3), info.width];
      for (const [index, part] of ["head", "top", "bottom"].entries()) {
        const tile = await sharp(record.path).extract({ left: cuts[index], top: 0, width: cuts[index + 1] - cuts[index], height: info.height }).png().toBuffer();
        await sharp(tile).trim({ background: "#00000000", threshold: 12 }).resize({ width: 720, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/try-on/costumes/${record.slug}-${part}.webp`);
      }
    } catch (error) { failures.push({ key: record.key, error: String(error) }); }
    continue;
  }
  if (record.kind === "part") {
    await sharp(record.path).trim({ background: "#00000000", threshold: 12 }).resize({ width: 720, height: 1000, fit: "inside", withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(`public/try-on/costumes/${record.slug}-${record.part}.webp`);
    continue;
  }
  const base = { alt_id: record.alt_id, alt_en: record.alt_en, credit, licence, licenceUrl: "", sourceUrl: "", originalUrl: "", kind: "illustration", objectPosition: "50% 50%" };
  if (record.kind === "chapter") {
    const directory = `public/illustrations/${record.slug}`; await mkdir(directory, { recursive: true });
    const file = `${directory}/chapter-${record.number}.webp`;
    await sharp(record.path).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 85, effort: 5 }).toFile(file);
    upsert(chapters, { slug: record.slug, number: record.number, url: file.replace(/^public/, ""), ...base }, (item) => `${item.slug}:${item.number}`);
    if (record.number === 1 && !covers.some((item) => item.type === "story" && item.slug === record.slug)) {
      const cover = `public/covers/story-${record.slug}-ai-v1.webp`; await copyFile(file, cover);
      covers.push({ type: "story", slug: record.slug, url: cover.replace(/^public/, ""), ...base });
    }
  } else if (record.kind === "cover") {
    const file = `public/covers/${record.type}-${record.slug}-ai-v1.webp`;
    await sharp(record.path).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 85, effort: 5 }).toFile(file);
    upsert(covers, { type: record.type, slug: record.slug, url: file.replace(/^public/, ""), ...base }, (item) => `${item.type}:${item.slug}`);
  }
}
covers.sort((a,b) => `${a.type}/${a.slug}`.localeCompare(`${b.type}/${b.slug}`));
chapters.sort((a,b) => a.slug.localeCompare(b.slug) || a.number - b.number);
await writeFile("src/lib/media/covers.json", JSON.stringify(covers, null, 2) + "\n");
await writeFile("src/lib/media/chapters.json", JSON.stringify(chapters, null, 2) + "\n");
const prompts = records.map((record) => Object.fromEntries(Object.entries(record).filter(([key]) => key !== "path")));
await writeFile("docs/project-media-prompts.json", JSON.stringify(prompts, null, 2) + "\n");
await writeFile("tmp/media/atlas-errors.json", JSON.stringify(failures, null, 2));
console.log({ generated: records.length, covers: covers.length, chapterIllustrations: chapters.length, atlasErrors: failures });
