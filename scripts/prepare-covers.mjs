// Download only files whose Commons API metadata confirms a reusable licence.
// Source rows come from our existing, reviewed media seed. Originals stay outside
// public; distributable WebP derivatives and attribution live in the repository.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const headers = { "User-Agent": "NusantaraCultureHub/1.0 (educational cultural archive; image attribution retained)" };
const sql = await readFile("supabase/content/2026-10-24-media-1.sql", "utf8");
const literal = "'((?:[^']|'')*)'";
const rx = new RegExp("\\(\\s*" + Array(7).fill(literal).join(",\\s*") + "\\s*\\)", "g");
const sources = [...sql.matchAll(rx)].map((m) => {
  const [type, slug, url, alt_id, alt_en, credit, licence] = m.slice(1).map((v) => v.replaceAll("''", "'"));
  return { type, slug, url, alt_id, alt_en, credit, licence };
}).filter((s) => s.url.startsWith("https://commons.wikimedia.org/wiki/Special:FilePath/"));
await mkdir("public/covers", { recursive: true });
await mkdir("src/lib/media", { recursive: true });
await mkdir("tmp/covers", { recursive: true });
const output = JSON.parse(await readFile("src/lib/media/covers.json", "utf8").catch(() => "[]"));
const failures = [];
async function fetchChecked(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(90000) });
    if (response.ok) return response;
    if (response.status !== 429 && response.status !== 503) throw new Error(`HTTP ${response.status} at ${new URL(url).hostname}`);
    const delay = Math.max(Number(response.headers.get("retry-after")) || 0, 5 * (attempt + 1));
    if (delay > 60) throw new Error(`Server asks to retry in ${delay}s; retry later`);
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }
  throw new Error(`Rate limited at ${new URL(url).hostname}`);
}
const pending = sources.filter((row) => !output.some((item) => item.type === row.type && item.slug === row.slug));
const titles = pending.map((row) => `File:${decodeURIComponent(row.url.split("Special:FilePath/")[1])}`);
const params = new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1200", titles: titles.join("|") });
const metadata = titles.length ? await (await fetchChecked(`https://commons.wikimedia.org/w/api.php?${params}`)).json() : { query: { pages: {} } };
const byTitle = new Map(Object.values(metadata.query.pages).map((page) => [page.title.replaceAll("_", " "), page]));
for (const row of sources) {
  if (output.some((item) => item.type === row.type && item.slug === row.slug)) continue;
  try {
    const title = decodeURIComponent(row.url.split("Special:FilePath/")[1]);
    const page = byTitle.get(`File:${title}`.replaceAll("_", " "));
    const info = page.imageinfo?.[0];
    if (!info) throw new Error("Commons file missing");
    const meta = info.extmetadata;
    const licence = meta.LicenseShortName?.value ?? "";
    if (!/^(CC BY(?:-SA)? [234]\.0|CC0(?: 1\.0)?|Public domain)$/i.test(licence)) throw new Error(`Unaccepted licence: ${licence}`);
    const sourceImage = info.thumburl || info.url;
    const data = Buffer.from(await (await fetchChecked(sourceImage)).arrayBuffer());
    const file = `${row.type}-${row.slug}.webp`;
    await sharp(data).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 83, effort: 5 }).toFile(`public/covers/${file}`);
    const artist = (meta.Artist?.value ?? row.credit).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const record = { type: row.type, slug: row.slug, url: `/covers/${file}`, alt_id: row.alt_id, alt_en: row.alt_en, credit: artist, licence, licenceUrl: meta.LicenseUrl?.value ?? "", sourceUrl: info.descriptionurl, originalUrl: row.url, kind: "picture", objectPosition: row.type === "costume" ? "50% 25%" : "50% 50%" };
    output.push(record);
    await writeFile(`tmp/covers/${row.type}-${row.slug}.metadata.json`, JSON.stringify({ page: page.title, imageinfo: info }, null, 2));
    console.log(`OK ${row.type}/${row.slug}: ${licence}`);
  } catch (error) {
    failures.push({ ...row, error: error.message });
    console.log(`FAILED ${row.type}/${row.slug}: ${error.message}`);
  }
  await writeFile("src/lib/media/covers.json", JSON.stringify(output, null, 2) + "\n");
  await writeFile("tmp/covers/failures.json", JSON.stringify(failures, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
console.log(`${output.length} covers ready; ${failures.length} require alternatives`);
