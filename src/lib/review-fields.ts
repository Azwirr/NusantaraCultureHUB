// Which fields the review queue can edit, per content type. Client-safe, so
// the editor form and the server action share one definition. Only these
// column names are ever written; anything else in a submitted form is ignored.

import type { ReviewEntityType } from "./review-types";

/** A bilingual pair: Indonesian and English side by side. */
export type FieldPair = { key: string; id: string; en: string; multiline: boolean; max: number };

export type SingleField =
  | { key: string; column: string; kind: "number"; min: number; max: number }
  | { key: string; column: string; kind: "url" }
  | { key: string; column: string; kind: "codes" }
  | { key: string; column: string; kind: "select"; options: readonly string[] }
  | { key: string; column: string; kind: "tags"; options: readonly string[] };

export const DIETARY_TAGS = [
  "vegetarian",
  "vegetarian_option",
  "contains_egg",
  "contains_beef",
  "contains_chicken",
  "contains_peanut",
  "contains_coconut",
  "contains_seafood",
  "contains_dairy",
  "contains_gluten",
] as const;

export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cm",
  "piece",
  "clove",
  "stalk",
  "leaf",
  "bunch",
  "whole",
  "to_taste",
] as const;

export const REVIEW_FIELDS: Record<ReviewEntityType, { pairs: FieldPair[]; singles: SingleField[] }> = {
  region: {
    pairs: [
      { key: "name", id: "name_id", en: "name_en", multiline: false, max: 120 },
      { key: "summary", id: "summary_id", en: "summary_en", multiline: true, max: 2000 },
    ],
    singles: [
      { key: "provinceCodes", column: "province_codes", kind: "codes" },
      { key: "sortOrder", column: "sort_order", kind: "number", min: 0, max: 1000 },
    ],
  },
  story: {
    pairs: [
      { key: "title", id: "title_id", en: "title_en", multiline: false, max: 200 },
      { key: "summary", id: "summary_id", en: "summary_en", multiline: true, max: 2000 },
    ],
    singles: [],
  },
  chapter: {
    pairs: [
      { key: "text", id: "text_id", en: "text_en", multiline: true, max: 20000 },
      { key: "audioDescription", id: "audio_description_id", en: "audio_description_en", multiline: true, max: 1000 },
      { key: "imageAlt", id: "image_alt_id", en: "image_alt_en", multiline: true, max: 500 },
    ],
    singles: [{ key: "imageUrl", column: "image_url", kind: "url" }],
  },
  recipe: {
    pairs: [{ key: "name", id: "name_id", en: "name_en", multiline: false, max: 160 }],
    singles: [
      { key: "servings", column: "servings", kind: "number", min: 1, max: 100 },
      { key: "minutes", column: "minutes", kind: "number", min: 1, max: 10000 },
      { key: "dietaryTags", column: "dietary_tags", kind: "tags", options: DIETARY_TAGS },
      { key: "halalStatus", column: "halal_status", kind: "select", options: ["unknown", "verified_by_source"] },
    ],
  },
  costume: {
    pairs: [
      { key: "name", id: "name_id", en: "name_en", multiline: false, max: 160 },
      { key: "info", id: "info_id", en: "info_en", multiline: true, max: 4000 },
    ],
    singles: [{ key: "referenceImageUrl", column: "reference_image_url", kind: "url" }],
  },
  ceremony: {
    pairs: [
      { key: "name", id: "name_id", en: "name_en", multiline: false, max: 160 },
      { key: "timing", id: "timing_id", en: "timing_en", multiline: false, max: 500 },
      { key: "summary", id: "summary_id", en: "summary_en", multiline: true, max: 2000 },
      { key: "body", id: "body_id", en: "body_en", multiline: true, max: 8000 },
    ],
    singles: [],
  },
};

/** Columns that must not be blank in Indonesian (the database requires them). */
export const REQUIRED_ID_COLUMNS = new Set(["name_id", "title_id"]);

/** ISO 3166-2:ID codes accepted by regions.province_codes (migration part 8). */
export const PROVINCE_CODES = [
  "ID-AC", "ID-SU", "ID-SB", "ID-RI", "ID-KR", "ID-JA", "ID-BE", "ID-SS", "ID-BB", "ID-LA",
  "ID-BT", "ID-JK", "ID-JB", "ID-JT", "ID-YO", "ID-JI", "ID-BA", "ID-NB", "ID-NT",
  "ID-KB", "ID-KT", "ID-KS", "ID-KI", "ID-KU",
  "ID-SA", "ID-GO", "ID-ST", "ID-SR", "ID-SN", "ID-SG",
  "ID-MA", "ID-MU", "ID-PA", "ID-PB", "ID-PD", "ID-PE", "ID-PS", "ID-PT",
] as const;
