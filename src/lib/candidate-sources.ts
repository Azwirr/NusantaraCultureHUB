// Candidate sources for the seed content, shown in the review queue as
// UNCHECKED suggestions. Nothing here is cited automatically: a reviewer opens
// the page, confirms it matches the draft, and only then adds it as a source.
//
// Every URL was opened and its title and publisher checked when it was added
// (see docs/candidate-sources.md). Add only real pages; never invent one.

import type { Locale } from "./i18n/config";
import type { ReviewEntityType } from "./review-types";

export type CandidateSource = {
  title: string;
  url: string;
  credit: string;
  /** What the page supports, so the reviewer knows what to check. */
  covers: Record<Locale, string>;
};

const KEMENPAR = "Kementerian Pariwisata RI (indonesia.travel)";

/** Keyed by `${type}:${slug}`. Opened and checked on 2026-10-23. */
export const CANDIDATE_SOURCES: Record<string, CandidateSource[]> = {
  "story:timun-mas": [
    {
      title: "Kisah Timun Mas, Cerita Rakyat dari Jawa Tengah",
      url: "https://www.detik.com/jateng/budaya/d-6264915/kisah-timun-mas-cerita-rakyat-dari-jawa-tengah",
      credit: "detikJateng, 1 September 2022",
      covers: {
        id: "Versi yang berbeda: Timun Mas lahir dari timun emas, benda-benda ajaib diberikan oleh seorang pertapa, dan benda keempat adalah terasi yang menjadi lumpur. Pilih satu versi lalu sesuaikan draf dengannya.",
        en: "A different version: Timun Mas is born from a golden cucumber, a hermit gives the items, and the fourth item is shrimp paste that becomes mud. Choose one version and match the draft to it.",
      },
    },
  ],
  "story:malin-kundang": [
    {
      title: "Kisah Legenda Malin Kundang dari Sumatera Barat Beserta Pesan Moralnya",
      url: "https://www.detik.com/sumut/budaya/d-6958903/kisah-legenda-malin-kundang-dari-sumatera-barat-beserta-pesan-moralnya",
      credit: "detikSumut, 1 October 2023",
      covers: {
        id: "Alur cerita, latar di pesisir Sumatera Barat (Air Manis), kutukan, dan pesan moralnya.",
        en: "Plot, setting on the West Sumatran coast (Air Manis), the curse and the moral.",
      },
    },
  ],
  "recipe:gudeg-yogyakarta": [
    {
      title: "Gudeg Yogyakarta: Sejarah, Jenis, dan Ciri Khas Kuliner Tradisional",
      url: "https://www.indonesia.travel/id/id/destination/java/yogyakarta/gudeg/",
      credit: KEMENPAR,
      covers: {
        id: "Nangka muda, santan, gula merah, dimasak berjam-jam. Telur dan ayam disajikan sebagai pendamping, tidak dimasak bersama.",
        en: "Young jackfruit, coconut milk, palm sugar, hours of slow cooking. Egg and chicken are served alongside, not cooked in.",
      },
    },
    {
      title: "Asal usul sejarah gudeg, kuliner legendaris dari Yogyakarta",
      url: "https://www.antaranews.com/berita/4742285/asal-usul-sejarah-gudeg-kuliner-legendaris-dari-yogyakarta",
      credit: "ANTARA News, 28 March 2025",
      covers: {
        id: "Sejarah; nangka muda dan santan. Tanpa takaran atau waktu memasak.",
        en: "History; young jackfruit and coconut milk. No amounts or cooking time.",
      },
    },
  ],
  "recipe:rawon": [
    {
      title: "Rawon: Sejarah, Bahan, dan Ciri Khasnya",
      url: "https://www.indonesia.travel/id-id/destination/java/east-java/rawon/",
      credit: KEMENPAR,
      covers: {
        id: "Daging sapi dan kluwek, daftar bumbu, disajikan dengan nasi, tauge, dan sambal. Tanpa takaran.",
        en: "Beef and kluwek, the spice list, served with rice, bean sprouts and sambal. No amounts.",
      },
    },
  ],
  "recipe:soto-ayam": [
    {
      title: "Soto Lamongan: Ciri Khas Kuah Koya, Bumbu, & Sejarahnya",
      url: "https://www.indonesia.travel/id-id/destination/java/east-java/soto-lamongan/",
      credit: KEMENPAR,
      covers: {
        id: "Salah satu varian soto ayam: ayam, kuah kunyit, telur. Halaman ini menyebut bihun, bukan soun.",
        en: "One soto ayam variant: chicken, turmeric broth, egg. It lists rice vermicelli (bihun), not glass noodles (soun).",
      },
    },
  ],
  "recipe:pecel": [
    {
      title: "Asal usul nasi pecel, kuliner tradisional yang jadi ikon Nusantara",
      url: "https://www.antaranews.com/berita/4742269/asal-usul-nasi-pecel-kuliner-tradisional-yang-jadi-ikon-nusantara",
      credit: "ANTARA News, 28 March 2025",
      covers: {
        id: "Sayuran rebus dengan bumbu kacang. Bahan bumbunya tidak dirinci.",
        en: "Blanched vegetables with ground peanut sauce. It does not list the sauce ingredients.",
      },
    },
  ],
  "recipe:rendang-daging": [
    {
      title: "Mengenal Rendang dan Tempat Untuk Menikmatinya",
      url: "https://www.indonesia.travel/id/id/travel-ideas/gastronomy/rendang-the-legendary-dish-from-west-sumatra/",
      credit: KEMENPAR,
      covers: {
        id: "Daging sapi, kelapa, cabai, dan bumbu; rendang kering dimasak berjam-jam sampai santannya habis.",
        en: "Beef, coconut, chili and spices; dry rendang cooked for hours until the coconut milk is gone.",
      },
    },
  ],
  "recipe:dendeng-balado": [
    {
      title: "Minangkabau's Dendeng Balado for Iftar and Sahoor Menu",
      url: "https://rri.co.id/en/culinary/1379284/minangkabau-s-dendeng-balado-for-iftar-and-sahoor-menu",
      credit: "RRI (Voice of Indonesia), 10 March 2025",
      covers: {
        id: "Daging sapi tipis, cabai merah, bawang merah, dan tomat. Caranya berbeda (daging direbus lalu digoreng sebentar) dan memakai daun jeruk, bukan air jeruk nipis.",
        en: "Thin beef, red chili, shallot and tomato. Its method differs (beef boiled, then fried briefly) and it uses lime leaves, not lime juice.",
      },
    },
  ],
  "recipe:sate-padang": [
    {
      title: "Sate Padang: History, Types, and Most Popular Recommendations",
      url: "https://www.indonesia.travel/uae-ar/travel-ideas/gastronomy/fakta-menarik-di-balik-nikmatnya-sate-padang",
      credit: KEMENPAR,
      covers: {
        id: "Daging sapi, daftar bumbu, dan kuah kental; berasal dari Padang Panjang. Tidak menyebut tepung beras atau kacang tanah.",
        en: "Beef, the spice list and the thick sauce; origin in Padang Panjang. It does not mention rice flour or peanuts.",
      },
    },
  ],
  "recipe:coto-makassar": [
    {
      title: "Resep Coto Makassar Asli, Hidangan Kaya Rempah yang Nikmat",
      url: "https://www.cnnindonesia.com/gaya-hidup/20240212132201-267-1061455/resep-coto-makassar-asli-hidangan-kaya-rempah-yang-nikmat",
      credit: "CNN Indonesia, 15 February 2024",
      covers: {
        id: "Resep lengkap dengan takaran: daging sapi dan jeroan, kacang tanah halus, serai, lengkuas, kemiri; disajikan dengan ketupat dan bawang goreng.",
        en: "A full recipe with amounts: beef plus offal, ground peanuts, lemongrass, galangal, candlenut; served with ketupat and fried shallots.",
      },
    },
  ],
  "recipe:konro-bakar": [
    {
      title: "Sop Konro: Makassar's Legendary Beef Rib Soup",
      url: "https://rri.co.id/voice-of-indonesia/culinary/2737271/sop-konro-makassars-legendary-beef-rib-soup",
      credit: "RRI (Voice of Indonesia), 18 September 2026",
      covers: {
        id: "Iga sapi dengan kluwek (tidak ada di draf); konro bakar direbus lalu dibakar, dengan saus kacang. Tidak menyebut kecap manis.",
        en: "Beef ribs with kluwek (missing from the draft); konro bakar is boiled, then grilled, with peanut sauce. It does not mention sweet soy sauce.",
      },
    },
  ],
  "recipe:barongko": [
    {
      title: "Berburu Takjil Barongko, Kue Khas Makassar",
      url: "https://www.kompas.tv/article/171901/berburu-takjil-barongko-kue-khas-makassar",
      credit: "Kompas TV, 7 May 2021",
      covers: {
        id: "Pisang kepok, telur, susu, dan gula; Warisan Budaya Takbenda Indonesia sejak 2017. Menyebut susu, bukan santan, dan tidak menjelaskan cara mengukus.",
        en: "Kepok banana, egg, milk and sugar; national intangible heritage since 2017. It says milk, not coconut milk, and does not describe the steaming.",
      },
    },
  ],
  "costume:baju-bodo": [
    {
      title: "Baju Bodo: Sejarah, Makna Warna, Bentuk, dan Fungsi Pakaian Adat Bugis",
      url: "https://www.indonesia.travel/id/id/travel-ideas/culture/baju-bodo/",
      credit: KEMENPAR,
      covers: {
        id: "Blus segi empat berlengan pendek yang dipadukan dengan sarung sutra (lipa' sabbe); dikenakan perempuan Bugis.",
        en: "Square-cut short-sleeved blouse worn with a silk sarong (lipa' sabbe); worn by Bugis women.",
      },
    },
  ],
  "costume:baju-bundo-kanduang": [
    {
      title:
        "Tinjauan Pakaian Adat Bundo Kanduang di Kenagarian Koto Tinggi Kecamatan Baso Kabupaten Agam Sumatera Barat",
      url: "https://ejournal.unp.ac.id/index.php/serupa/article/view/3218",
      credit: "Rela Gusparini, Zubaidah. Serupa: The Journal of Art Education 2(2), 2014",
      covers: {
        id: "Bagian busana: tangkuluak, baju kurung, kodek, dan sandang. Abstraknya tidak menyebut songket atau suntiang.",
        en: "Parts of the dress: tangkuluak headdress, baju kurung, kodek and sandang. Its abstract does not mention songket or the suntiang.",
      },
    },
  ],
  "costume:pengantin-jawa": [
    {
      title: "Mengenal Beskap dan Asal-usulnya",
      url: "https://www.goodnewsfromindonesia.id/infographic/mengenal-beskap-dan-asal-usulnya",
      credit: "Good News From Indonesia, 2 May 2025",
      covers: {
        id: "Beskap pengantin pria, dikenakan dengan blangkon, jarik, dan keris. Tidak membahas kebaya pengantin perempuan.",
        en: "The groom's beskap, worn with blangkon, jarik and keris. It does not cover the bride's kebaya.",
      },
    },
  ],
};

export function candidateSourcesFor(type: ReviewEntityType, slug: unknown): CandidateSource[] {
  if (typeof slug !== "string") return [];
  return CANDIDATE_SOURCES[`${type}:${slug}`] ?? [];
}
