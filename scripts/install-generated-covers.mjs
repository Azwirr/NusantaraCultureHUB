import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const jobs = JSON.parse(await readFile("tmp/covers/generated-jobs.json", "utf8"));
const catalog = JSON.parse(await readFile("src/lib/media/covers.json", "utf8"));
const meta = {
  "baju-bundo-kanduang": ["costume", "Ilustrasi AI Bundo Kanduang dengan baju kurung, songket, dan tingkuluak", "AI illustration of Bundo Kanduang dress with baju kurung, songket and tingkuluak"],
  "kebaya-sunda": ["costume", "Ilustrasi AI kebaya Sunda berleher U dengan kain batik", "AI illustration of a U-neck Sundanese kebaya with a batik wrap"],
  "pengantin-jawa": ["costume", "Ilustrasi AI pengantin Jawa dengan kebaya, beskap, dan blangkon", "AI illustration of Javanese wedding clothing with kebaya, beskap and blangkon"],
  "papeda": ["recipe", "Ilustrasi AI papeda sagu yang bening dan kenyal bersama kuah kuning", "AI illustration of translucent stretchy sago papeda with yellow fish broth"],
  "payas-agung": ["costume", "Ilustrasi AI pengantin Bali dengan payas agung dan mahkota emas", "AI illustration of a Balinese bride in payas agung and a golden crown"],
  "rok-rumbai": ["costume", "Ilustrasi AI perempuan Papua dengan rok rumbai serat tumbuhan", "AI illustration of a Papuan woman wearing a plant-fibre fringe skirt"],
  "bagajah-gamuling-baular-lulut": ["costume", "Ilustrasi AI busana pengantin Banjar dengan udat dan untaian melati", "AI illustration of Banjar bridal clothing with an udat wrap and jasmine garlands"],
  "baju-cele": ["costume", "Ilustrasi AI busana cele merah dengan sarung dan lenso", "AI illustration of red cele clothing with a sarong and lenso handkerchief"],
  "ayam-betutu": ["recipe", "Ilustrasi AI ayam betutu berbumbu di atas daun pisang", "AI illustration of spiced ayam betutu served on banana leaf"],
  "nasi-timbel": ["recipe", "Ilustrasi AI nasi timbel isi ayam dalam bungkus daun pisang", "AI illustration of chicken-filled nasi timbel in banana-leaf parcels"],
  "ikan-kuah-kuning": ["recipe", "Ilustrasi AI ikan kakap dalam kuah kunyit dengan kemangi dan tomat", "AI illustration of snapper in turmeric broth with basil and tomato"],
  "timun-mas": ["story", "Ilustrasi AI Timun Mas berlari di kebun timun dengan raksasa di kejauhan", "AI illustration of Timun Mas running through a cucumber field with a distant giant"],
  "batu-berdaun": ["story", "Ilustrasi AI batu berbentuk daun di bukit pesisir Maluku", "AI illustration of a leaf-shaped stone on a coastal hill in Maluku"],
  "kasuari-dan-dara-makota": ["story", "Ilustrasi AI kasuari dan burung dara mahkota di hutan Papua", "AI illustration of a cassowary and crowned pigeon in a Papuan forest"],
};
await mkdir("public/covers", { recursive: true });
for (const job of jobs) {
  const path = job.output_hint.match(/ as (C:\\[^\n]+\.png) by default/)?.[1];
  if (!path) throw new Error(`No output path for ${job.slug}`);
  const [type, alt_id, alt_en] = meta[job.slug];
  const file = `${type}-${job.slug}.webp`;
  await sharp(path).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 85, effort: 5 }).toFile(`public/covers/${file}`);
  const item = { type, slug: job.slug, url: `/covers/${file}`, alt_id, alt_en, credit: "Nusantara Culture Hub · OpenAI", licence: "Ilustrasi AI / AI illustration", licenceUrl: "", sourceUrl: "", originalUrl: "", kind: "illustration", objectPosition: "50% 50%" };
  const index = catalog.findIndex((row) => row.type === type && row.slug === job.slug);
  if (index < 0) catalog.push(item); else catalog[index] = item;
  console.log(`Installed ${file}`);
}
catalog.sort((a,b) => `${a.type}/${a.slug}`.localeCompare(`${b.type}/${b.slug}`));
await writeFile("src/lib/media/covers.json", JSON.stringify(catalog, null, 2) + "\n");
await writeFile("docs/cover-prompts.json", JSON.stringify(jobs.map(({slug,prompt})=>({slug,prompt,tool:"Built-in image_gen",date:"2026-10-24"})), null, 2) + "\n");
console.log(`${catalog.length} distinct item covers`);
