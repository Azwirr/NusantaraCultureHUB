// The seven islands and island groups the region map is split into. Each
// groups ISO 3166-2:ID province codes (the 2022 Papua provinces are listed
// too, so regions that use them still land on Papua). Label points are in
// the map's viewBox (see indonesia-provinces.ts). Names and notes are UI copy.

export type IslandSlug = "sumatera" | "jawa" | "bali-nusa-tenggara" | "kalimantan" | "sulawesi" | "maluku" | "papua";

export type Island = {
  slug: IslandSlug;
  name: { id: string; en: string };
  note: { id: string; en: string };
  provinces: readonly string[];
  label: { x: number; y: number };
};

export const ISLANDS: readonly Island[] = [
  {
    slug: "sumatera",
    name: { id: "Sumatera", en: "Sumatra" },
    note: {
      id: "Pulau besar di barat Nusantara, dari Aceh sampai Lampung, bersama Kepulauan Riau dan Bangka Belitung.",
      en: "The large island in the west of the archipelago, from Aceh to Lampung, with the Riau and Bangka Belitung islands.",
    },
    provinces: ["ID-AC", "ID-SU", "ID-SB", "ID-RI", "ID-KR", "ID-JA", "ID-BE", "ID-SS", "ID-BB", "ID-LA"],
    label: { x: 118, y: 150 },
  },
  {
    slug: "jawa",
    name: { id: "Jawa", en: "Java" },
    note: {
      id: "Pulau terpadat di Indonesia, dari Banten di barat sampai Jawa Timur.",
      en: "Indonesia's most populous island, from Banten in the west to East Java.",
    },
    provinces: ["ID-BT", "ID-JK", "ID-JB", "ID-JT", "ID-YO", "ID-JI"],
    label: { x: 330, y: 258 },
  },
  {
    slug: "bali-nusa-tenggara",
    name: { id: "Bali & Nusa Tenggara", en: "Bali & Nusa Tenggara" },
    note: {
      id: "Rangkaian pulau dari Bali ke timur sampai Timor: Bali, Nusa Tenggara Barat, dan Nusa Tenggara Timur.",
      en: "The chain of islands from Bali east to Timor: Bali, West Nusa Tenggara and East Nusa Tenggara.",
    },
    provinces: ["ID-BA", "ID-NB", "ID-NT"],
    label: { x: 545, y: 300 },
  },
  {
    slug: "kalimantan",
    name: { id: "Kalimantan", en: "Kalimantan" },
    note: {
      id: "Bagian Indonesia di Pulau Kalimantan (Borneo), dengan lima provinsi.",
      en: "The Indonesian part of the island of Borneo, with five provinces.",
    },
    provinces: ["ID-KB", "ID-KT", "ID-KS", "ID-KI", "ID-KU"],
    label: { x: 405, y: 125 },
  },
  {
    slug: "sulawesi",
    name: { id: "Sulawesi", en: "Sulawesi" },
    note: {
      id: "Pulau berlengan empat di tengah Nusantara, dengan enam provinsi.",
      en: "The four-armed island in the middle of the archipelago, with six provinces.",
    },
    provinces: ["ID-SA", "ID-GO", "ID-ST", "ID-SR", "ID-SN", "ID-SG"],
    label: { x: 585, y: 175 },
  },
  {
    slug: "maluku",
    name: { id: "Maluku", en: "Maluku" },
    note: {
      id: "Kepulauan rempah di timur Indonesia: Maluku dan Maluku Utara.",
      en: "The spice islands in eastern Indonesia: Maluku and North Maluku.",
    },
    provinces: ["ID-MA", "ID-MU"],
    label: { x: 735, y: 160 },
  },
  {
    slug: "papua",
    name: { id: "Papua", en: "Papua" },
    note: {
      id: "Bagian barat Pulau Papua (Nugini), wilayah paling timur Indonesia.",
      en: "The western half of the island of New Guinea, the easternmost part of Indonesia.",
    },
    provinces: ["ID-PA", "ID-PB", "ID-PD", "ID-PE", "ID-PS", "ID-PT"],
    label: { x: 880, y: 245 },
  },
];

const BY_PROVINCE = new Map(ISLANDS.flatMap((island) => island.provinces.map((code) => [code, island] as const)));

export function islandOf(provinceCode: string): Island | undefined {
  return BY_PROVINCE.get(provinceCode);
}

export function getIsland(slug: string): Island | undefined {
  return ISLANDS.find((island) => island.slug === slug);
}

/** True when a region with these province codes lies (at least partly) on the island. */
export function onIsland(island: Island, provinceCodes: readonly string[]): boolean {
  return provinceCodes.some((code) => island.provinces.includes(code));
}
