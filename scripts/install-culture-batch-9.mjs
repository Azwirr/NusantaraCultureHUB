import { readFile, writeFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const images = [
  ["ceremony", "pasola", "Dramatic but respectful editorial illustration of Pasola in West Sumba, East Nusa Tenggara: Sumbanese horse riders in traditional woven ikat and headcloths on sturdy horses, holding blunt wooden spears in a ceremonial contest across a grassy field, distant dry hills and village spectators, movement and dust, culturally grounded Sumba architecture, no blood, no injury, no violence detail, documentary-art realism, warm natural daylight, landscape 3:2 composition."],
  ["ceremony", "ngaben", "Respectful editorial illustration of a Balinese Hindu Ngaben procession in Bali: ornate bade tower and animal-shaped patulangan carried through a village street, families in modest traditional Balinese ceremonial clothing, offerings and temple architecture, no body visible, no cremation or fire detail, reverent documentary-art realism, warm daylight, landscape 3:2 composition."],
  ["ceremony", "tiwah", "Respectful editorial illustration of a Dayak Ngaju Tiwah ceremony in Central Kalimantan: families gathered near a carved ironwood sapundu post and a traditional sandung bone-house, ceremonial textiles and offerings, lush riverine forest village, no remains, no body, no animal sacrifice, reverent documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "sekaten", "Editorial illustration of Sekaten in Yogyakarta: Javanese court gamelan musicians performing in a palace pavilion, visitors in modest batik and traditional dress, a graceful gunungan procession in the background, no religious caricature, historically grounded architecture and instruments, warm evening lantern light, landscape 3:2 composition."],
  ["ceremony", "seren-taun", "Editorial illustration of Seren Taun harvest thanksgiving in Cigugur, West Java: Sundanese community in traditional attire carrying rice bundles and a decorated harvest offering toward a village hall, rice fields and hills, respectful depiction of living tradition, documentary-art realism, gentle daylight, landscape 3:2 composition."],
  ["ceremony", "yadnya-kasada", "Respectful editorial illustration of Yadnya Kasada at Mount Bromo, East Java: Tenggerese people in traditional clothing making a procession with crops and flowers toward the crater viewpoint, Mount Bromo and sea of sand in the distance, no one falling or in danger, sacred ceremony shown reverently, dawn light, landscape 3:2 composition."],
  ["ceremony", "mapalus", "Editorial illustration of Mapalus communal work in Minahasa, North Sulawesi: neighbors working together in a green village field, planting and carrying harvest baskets, traditional North Sulawesi architecture in the distance, warm communal atmosphere, culturally grounded clothing, documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "bakar-batu", "Respectful editorial illustration of a Dani community Bakar Batu feast in the Baliem Valley, Papua: community members preparing a shared earth-oven meal with hot stones, banana leaves and vegetables, elders and families in culturally respectful attire, no stereotypes, no exposed body, mountain valley setting, documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "manene", "Respectful editorial illustration of the Toraja Ma'nene family remembrance tradition in South Sulawesi: relatives gathered around a family tongkonan and carved wooden tau-tau, sharing stories and tending woven textiles, no remains, no bodies, no coffins, reverent and dignified, highland landscape, documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "tabuik", "Editorial illustration of Tabuik in Pariaman, West Sumatra: colorful towering Tabuik structures carried by a large crowd toward the coast during the cultural procession, Minangkabau clothing and coastal town setting, energetic but respectful, no depiction of violence, golden afternoon, landscape 3:2 composition."],
  ["ceremony", "mappacci", "Editorial illustration of a Bugis Mappacci pre-wedding ritual in South Sulawesi: bride and groom seated modestly in traditional silk attire, family elders applying symbolic pacci henna leaves to the bride's palms, warm decorated home, respectful private family ceremony, landscape 3:2 composition."],
  ["ceremony", "mangongkal-holi", "Respectful editorial illustration of the Batak Toba Mangongkal Holi ancestral remembrance gathering in North Sumatra: extended family in ulos textiles assembled at a traditional Batak house, elders speaking and offerings arranged, no graves, bones, remains, or coffins shown, dignified communal ceremony, Lake Toba highlands, landscape 3:2 composition."],
  ["ceremony", "baayun-maulid", "Gentle editorial illustration of Baayun Maulid in Banjar, South Kalimantan: infants safely resting in decorated traditional cloth cradles suspended indoors while families gather for prayers and celebration, bright woven textiles and Banjar ornaments, no unattended baby, respectful and warm, landscape 3:2 composition."],
  ["ceremony", "pukul-sapu", "Respectful editorial illustration of the Pukul Sapu tradition in Mamala, Maluku: two adult participants in traditional attire perform a symbolic cane ritual at a village festival, shown before contact with long soft-looking ritual rods, no wounds, blood, injury, or impact, supportive crowd, documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "bau-nyale", "Editorial illustration of Bau Nyale on a Lombok beach, West Nusa Tenggara: Sasak families at dawn gently collecting tiny sea worms from shallow water during the seasonal festival, traditional woven clothing, calm surf and coastal hills, respectful community scene, landscape 3:2 composition."],
  ["ceremony", "palang-pintu", "Editorial illustration of a Betawi Palang Pintu wedding tradition in Jakarta: two adult performers in traditional Betawi attire exchange pantun and demonstrate silat footwork playfully before a wedding procession, no striking or injury, ondel-ondel and tanjidor musicians nearby, colorful respectful urban neighborhood, landscape 3:2 composition."],
  ["ceremony", "peusijuek", "Respectful editorial illustration of Peusijuek in Aceh: an Acehnese elder blessing a family with water and rice leaves in a home gathering, guests in modest traditional Acehnese clothing, calm and reverent, clear local textiles and interior, documentary-art realism, landscape 3:2 composition."],
  ["ceremony", "caci", "Respectful editorial illustration of Caci dance in Manggarai, Flores: two adult dancers in traditional Manggarai clothing, masks and headgear pose in a cultural performance arena with shields and whips held ceremonially, no contact, no injury, no blood, audience and village setting, landscape 3:2 composition."],
  ["ceremony", "rambu-solo", "Respectful editorial illustration of a Toraja Rambu Solo' funeral ceremony in South Sulawesi: large community gathered in a traditional tongkonan courtyard, buffalo presented at a distance as part of a solemn customary event, no killing, blood, body, or coffin, dignified architecture and textiles, landscape 3:2 composition."],
  ["ceremony", "karapan-sapi", "Editorial illustration of Karapan Sapi in Madura, East Java: two healthy bulls wearing colorful decorative harnesses pull a lightweight wooden sled across a sandy race track, skilled jockey balanced safely, spectators behind barriers, no injury or animal distress, bright festival atmosphere, landscape 3:2 composition."],
  ["recipe", "pisang-epe", "Appetizing editorial food photography illustration of Pisang Epe, Makassar: flattened grilled kepok bananas with light char marks on a small plate, glossy palm-sugar syrup and pandan leaf garnish, simple Makassar street-food presentation, natural soft daylight, no text, landscape 3:2 composition."],
  ["recipe", "nasu-likku", "Appetizing editorial food photography illustration of Bugis Nasu Likku from South Sulawesi: tender chicken pieces cooked in rich golden coconut milk with visibly abundant finely shredded galangal, lemongrass and warm spices, served in a traditional ceramic bowl with rice, natural soft daylight, no text, landscape 3:2 composition."],
  ["story", "putri-junjung-buih", "Respectful editorial illustration inspired by the Banjar folklore Putri Junjung Buih of South Kalimantan: a young princess in elegant historical Banjar ceremonial clothing emerges symbolically from luminous river foam near the Tabalong River, a royal family watches from the bank, richly detailed traditional Banjar motifs, magical realism, no text, landscape 3:2 composition."],
];

const labels = {
  "pasola": ["Pasola di Sumba Barat, Nusa Tenggara Timur", "Pasola in West Sumba, East Nusa Tenggara"],
  "ngaben": ["Prosesi Ngaben di Bali", "Ngaben procession in Bali"],
  "tiwah": ["Ritual Tiwah Dayak Ngaju di Kalimantan Tengah", "Dayak Ngaju Tiwah ritual in Central Kalimantan"],
  "sekaten": ["Gamelan dan gunungan dalam perayaan Sekaten", "Gamelan and gunungan at the Sekaten festival"],
  "seren-taun": ["Syukuran panen Seren Taun masyarakat Sunda", "Sundanese Seren Taun harvest thanksgiving"],
  "yadnya-kasada": ["Prosesi Yadnya Kasada masyarakat Tengger di Bromo", "Tengger Yadnya Kasada procession at Bromo"],
  "mapalus": ["Gotong royong Mapalus di Minahasa", "Mapalus communal work in Minahasa"],
  "bakar-batu": ["Persiapan pesta Bakar Batu di Lembah Baliem", "Bakar Batu feast preparation in the Baliem Valley"],
  "manene": ["Keluarga Toraja berkumpul untuk tradisi Ma'nene", "Toraja family gathering for the Ma'nene tradition"],
  "tabuik": ["Arak-arakan Tabuik di Pariaman", "Tabuik procession in Pariaman"],
  "mappacci": ["Ritual Mappacci dalam adat pernikahan Bugis", "Mappacci ritual in a Bugis wedding tradition"],
  "mangongkal-holi": ["Keluarga Batak Toba berkumpul mengenakan ulos", "Batak Toba family gathering in ulos textiles"],
  "baayun-maulid": ["Ayunan bayi berhias dalam tradisi Baayun Maulid Banjar", "Decorated baby cradles at the Banjar Baayun Maulid tradition"],
  "pukul-sapu": ["Pertunjukan tradisi Pukul Sapu di Maluku", "Pukul Sapu cultural performance in Maluku"],
  "bau-nyale": ["Masyarakat Sasak mencari nyale di pantai Lombok", "Sasak community gathering nyale on a Lombok beach"],
  "palang-pintu": ["Pantun dan silat dalam tradisi Palang Pintu Betawi", "Pantun and silat in the Betawi Palang Pintu tradition"],
  "peusijuek": ["Prosesi Peusijuek di Aceh", "Peusijuek blessing ceremony in Aceh"],
  "caci": ["Pertunjukan tari Caci Manggarai di Flores", "Manggarai Caci dance performance in Flores"],
  "rambu-solo": ["Keluarga berkumpul dalam upacara Rambu Solo' Toraja", "Family gathering at a Toraja Rambu Solo' ceremony"],
  "karapan-sapi": ["Lomba Karapan Sapi di Madura", "Karapan Sapi race in Madura"],
  "pisang-epe": ["Pisang Epe Makassar dengan saus gula merah", "Makassar Pisang Epe with palm-sugar sauce"],
  "nasu-likku": ["Nasu Likku Bugis dengan ayam dan lengkuas", "Bugis Nasu Likku chicken with galangal"],
  "putri-junjung-buih": ["Ilustrasi Putri Junjung Buih dari cerita rakyat Banjar", "Illustration of Putri Junjung Buih from Banjar folklore"],
};

const covers = JSON.parse(await readFile("src/lib/media/covers.json", "utf8"));
const prompts = JSON.parse(await readFile("docs/project-media-prompts.json", "utf8"));
const baseCredit = { credit: "Nusantara Culture Hub · OpenAI", licence: "Ilustrasi AI / AI illustration", licenceUrl: "", sourceUrl: "", originalUrl: "", kind: "illustration", objectPosition: "50% 50%" };
await mkdir("public/covers", { recursive: true });
for (const [type, slug, prompt] of images) {
  const input = `tmp/ceremony-images/${type}-${slug}.png`;
  const filename = `public/covers/${type}-${slug}-ai-v1.webp`;
  await sharp(input).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 85, effort: 5 }).toFile(filename);
  const [alt_id, alt_en] = labels[slug].map((value) => value.includes("AI") ? value : `Ilustrasi AI: ${value}`);
  const row = { type, slug, url: filename.replace(/^public/, ""), alt_id, alt_en, ...baseCredit };
  const at = covers.findIndex((item) => item.type === type && item.slug === slug);
  if (at < 0) covers.push(row); else covers[at] = row;
  const promptRow = { key: `${type}-${slug}-ai-v1`, kind: "cover", type, slug, prompt, created_with: "OpenAI image generation", alt_id, alt_en };
  const promptAt = prompts.findIndex((item) => item.key === promptRow.key);
  if (promptAt < 0) prompts.push(promptRow); else prompts[promptAt] = promptRow;
}
covers.sort((a, b) => `${a.type}/${a.slug}`.localeCompare(`${b.type}/${b.slug}`));
await writeFile("src/lib/media/covers.json", JSON.stringify(covers, null, 2) + "\n");
await writeFile("docs/project-media-prompts.json", JSON.stringify(prompts, null, 2) + "\n");
console.log(`Installed ${images.length} covers; registry has ${covers.length} entries.`);
