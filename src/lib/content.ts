import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CONTENT_TAG } from "./content-tags";
import { localCover, type Cover } from "./media/covers";
import { costumeParts } from "./try-on/assets";
import type { Locale } from "./i18n/config";
import { createPublicClient } from "./supabase/public";

// Public (approved) content for guest pages. Every cached read uses the guest
// client, so RLS returns approved rows only, and is tagged CONTENT_TAG: review
// actions expire it when something is approved or unpublished.
// The load* functions take a client, so the review queue can preview a draft
// with the same templates through the reviewer's own session.
// Content text is data. Pages render it as plain text nodes only.

/** The guest client for public pages, or a reviewer session client for previews. */
export type ContentClient = ReturnType<typeof createPublicClient>;

/** Saveable content types (members can save these). */
export type PublicType = "story" | "recipe" | "costume";

/** Everything the library, regions and search show. Ceremonies cannot be saved yet. */
export type LibraryType = PublicType | "ceremony";

export type ContentCard = {
  type: LibraryType;
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  region: { slug: string; name: string } | null;
  minutes: number | null;
  /** The item's first picture, if one is published with it. */
  picture: Cover | null;
};

export type RegionSummary = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  provinceCodes: string[];
  counts: Record<LibraryType, number>;
};

export type SourceItem = { id: string; title: string; url: string | null; credit: string | null; license: string | null };

type Pair = { id: string | null; en: string | null };
type RegionRef = { slug: string; name_id: string; name_en: string | null } | null;
type Key = { slug: string } | { id: string };

/** Approved content has both languages; fall back to the other one just in case. */
export function pick(locale: Locale, value: Pair): string {
  return (locale === "en" ? value.en || value.id : value.id || value.en) ?? "";
}

function regionRef(locale: Locale, region: RegionRef) {
  return region ? { slug: region.slug, name: pick(locale, { id: region.name_id, en: region.name_en }) } : null;
}

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`public content (${what}): ${error?.message ?? "unknown error"}`);
}

/** Every approved story, recipe, costume and ceremony as a card, newest first. */
export async function getLibrary(locale: Locale): Promise<ContentCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const supabase = createPublicClient();
  const region = "regions(slug, name_id, name_en)";
  const [stories, recipes, costumes, ceremonies, pictures] = await Promise.all([
    supabase.from("stories").select(`id, slug, title_id, title_en, summary_id, summary_en, updated_at, ${region}`),
    supabase.from("recipes").select(`id, slug, name_id, name_en, minutes, updated_at, ${region}`),
    supabase.from("costumes").select(`id, slug, name_id, name_en, info_id, info_en, updated_at, ${region}`),
    supabase.from("ceremonies").select(`id, slug, name_id, name_en, summary_id, summary_en, updated_at, ${region}`),
    supabase
      .from("content_media")
      .select("content_type, content_id, url, alt_id, alt_en, sort_order, credit, licence, kind")
      .in("content_type", ["story", "recipe", "costume", "ceremony"])
      .order("sort_order"),
  ]);
  if (pictures.error) fail("media", pictures.error);
  const firstPicture = new Map<string, Cover>();
  for (const row of pictures.data) {
    const key = `${row.content_type}:${row.content_id}`;
    if (!firstPicture.has(key)) firstPicture.set(key, {
      url: row.url, alt: pick(locale, { id: row.alt_id, en: row.alt_en }), credit: row.credit,
      licence: row.licence, kind: row.kind === "illustration" ? "illustration" : "picture",
    });
  }
  if (stories.error) fail("stories", stories.error);
  if (recipes.error) fail("recipes", recipes.error);
  if (costumes.error) fail("costumes", costumes.error);
  if (ceremonies.error) fail("ceremonies", ceremonies.error);

  const cards: Array<Omit<ContentCard, "picture"> & { updatedAt: string }> = [
    ...stories.data.map((row) => ({
      type: "story" as const, id: row.id, slug: row.slug, updatedAt: row.updated_at, minutes: null,
      title: pick(locale, { id: row.title_id, en: row.title_en }),
      summary: pick(locale, { id: row.summary_id, en: row.summary_en }) || null,
      region: regionRef(locale, row.regions),
    })),
    ...recipes.data.map((row) => ({
      type: "recipe" as const, id: row.id, slug: row.slug, updatedAt: row.updated_at, minutes: row.minutes,
      title: pick(locale, { id: row.name_id, en: row.name_en }),
      summary: null,
      region: regionRef(locale, row.regions),
    })),
    ...costumes.data.map((row) => ({
      type: "costume" as const, id: row.id, slug: row.slug, updatedAt: row.updated_at, minutes: null,
      title: pick(locale, { id: row.name_id, en: row.name_en }),
      summary: pick(locale, { id: row.info_id, en: row.info_en }) || null,
      region: regionRef(locale, row.regions),
    })),
    ...ceremonies.data.map((row) => ({
      type: "ceremony" as const, id: row.id, slug: row.slug, updatedAt: row.updated_at, minutes: null,
      title: pick(locale, { id: row.name_id, en: row.name_en }),
      summary: pick(locale, { id: row.summary_id, en: row.summary_en }) || null,
      region: regionRef(locale, row.regions),
    })),
  ];
  return cards
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((card) => ({
      type: card.type, id: card.id, slug: card.slug, title: card.title,
      summary: card.summary, region: card.region, minutes: card.minutes,
      picture: localCover(card.type, card.slug, locale) ?? firstPicture.get(`${card.type}:${card.id}`) ?? null,
    }));
}

/** Approved regions with the number of approved items in each. */
export async function getRegions(locale: Locale): Promise<RegionSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const { data, error } = await createPublicClient()
    .from("regions")
    .select("id, slug, name_id, name_en, summary_id, summary_en, province_codes, sort_order")
    .order("sort_order")
    .order("name_id");
  if (error) fail("regions", error);
  const library = await getLibrary(locale);
  return data.map((row) => {
    const items = library.filter((card) => card.region?.slug === row.slug);
    const count = (type: LibraryType) => items.filter((card) => card.type === type).length;
    return {
      id: row.id,
      slug: row.slug,
      name: pick(locale, { id: row.name_id, en: row.name_en }),
      summary: pick(locale, { id: row.summary_id, en: row.summary_en }) || null,
      provinceCodes: row.province_codes,
      counts: { story: count("story"), recipe: count("recipe"), costume: count("costume"), ceremony: count("ceremony") },
    };
  });
}

export type RegionDetail = RegionSummary & { items: ContentCard[] };

export async function getRegion(slug: string, locale: Locale): Promise<RegionDetail | null> {
  const region = (await getRegions(locale)).find((item) => item.slug === slug);
  if (!region) return null;
  const items = (await getLibrary(locale)).filter((card) => card.region?.slug === slug);
  return { ...region, items };
}

/** Sources cited by an item. For guests, RLS hides sources of hidden content. */
async function sourcesFor(supabase: ContentClient, type: string, id: string): Promise<SourceItem[]> {
  const { data, error } = await supabase
    .from("content_sources")
    .select("sources(id, title, url, credit, license)")
    .eq("content_type", type)
    .eq("content_id", id);
  if (error) fail("sources", error);
  return data.flatMap((row) => (row.sources ? [row.sources] : []));
}

export type StoryDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  picture: Cover | null;
  region: { slug: string; name: string } | null;
  chapters: Array<{
    id: string;
    number: number;
    text: string;
    audioDescription: string;
    imageAlt: string;
    imageUrl: string | null;
    imageCredit: { credit: string; licence: string } | null;
  }>;
  sources: SourceItem[];
};

export async function getStory(slug: string, locale: Locale): Promise<StoryDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  return loadStory(createPublicClient(), { slug }, locale);
}

/** One story by slug or id, as the given client may see it. */
export async function loadStory(supabase: ContentClient, key: Key, locale: Locale): Promise<StoryDetail | null> {
  const query = supabase
    .from("stories")
    .select("id, slug, title_id, title_en, summary_id, summary_en, regions(slug, name_id, name_en)");
  const { data: story, error } = await ("slug" in key ? query.eq("slug", key.slug) : query.eq("id", key.id)).maybeSingle();
  if (error) fail("story", error);
  if (!story) return null;
  const [chapters, sources] = await Promise.all([
    supabase
      .from("story_chapters")
      .select(
        "id, chapter_no, text_id, text_en, audio_description_id, audio_description_en, image_alt_id, image_alt_en, image_url",
      )
      .eq("story_id", story.id)
      .order("chapter_no"),
    sourcesFor(supabase, "story", story.id),
  ]);
  if (chapters.error) fail("chapters", chapters.error);
  // Chapter illustrations (or pictures) from content_media, else the chapter image field.
  const chapterIds = chapters.data.map((row) => row.id);
  const media = chapterIds.length
    ? await supabase
        .from("content_media")
        .select("content_id, url, credit, licence, sort_order")
        .eq("content_type", "story_chapter")
        .in("content_id", chapterIds)
        .order("sort_order")
    : { data: [], error: null };
  if (media.error) fail("chapter media", media.error);
  const mediaByChapter = new Map<string, { url: string; credit: string; licence: string }>();
  for (const row of media.data) if (!mediaByChapter.has(row.content_id)) mediaByChapter.set(row.content_id, row);
  return {
    id: story.id,
    slug: story.slug,
    title: pick(locale, { id: story.title_id, en: story.title_en }),
    summary: pick(locale, { id: story.summary_id, en: story.summary_en }),
    picture: localCover("story", story.slug, locale),
    region: regionRef(locale, story.regions),
    chapters: chapters.data.map((row) => ({
      id: row.id,
      number: row.chapter_no,
      text: pick(locale, { id: row.text_id, en: row.text_en }),
      audioDescription: pick(locale, { id: row.audio_description_id, en: row.audio_description_en }),
      imageAlt: pick(locale, { id: row.image_alt_id, en: row.image_alt_en }),
      imageUrl: mediaByChapter.get(row.id)?.url ?? row.image_url,
      imageCredit: mediaByChapter.get(row.id)
        ? { credit: mediaByChapter.get(row.id)!.credit, licence: mediaByChapter.get(row.id)!.licence }
        : null,
    })),
    sources,
  };
}

/** A picture or illustration for an item, with the credit and licence it must show. */
export type MediaItem = Cover;

/** The first picture of each item (see supabase/migrations/20261024001600_content_media.sql). */
async function firstMedia(
  supabase: ContentClient,
  type: "recipe" | "costume" | "story_chapter" | "ceremony",
  id: string,
  locale: Locale,
): Promise<MediaItem | null> {
  const { data, error } = await supabase
    .from("content_media")
    .select("url, alt_id, alt_en, credit, licence, kind")
    .eq("content_type", type)
    .eq("content_id", id)
    .order("sort_order")
    .limit(1);
  if (error) fail("media", error);
  const row = data[0];
  if (!row) return null;
  return { url: row.url, alt: pick(locale, { id: row.alt_id, en: row.alt_en }), credit: row.credit, licence: row.licence, kind: row.kind === "illustration" ? "illustration" : "picture" };
}

export type RecipeDetail = {
  id: string;
  slug: string;
  title: string;
  /** The name in the other language (FR-07: bilingual names). */
  altTitle: string;
  region: { slug: string; name: string } | null;
  /** Null when the source does not say: amounts are shown as written, without scaling. */
  servings: number | null;
  minutes: number | null;
  dietaryTags: string[];
  halalStatus: string;
  ingredients: Array<{ id: string; name: string; amount: number | null; unit: string | null }>;
  steps: Array<{ id: string; number: number; text: string; timerSeconds: number | null }>;
  sources: SourceItem[];
  picture: MediaItem | null;
};

export async function getRecipe(slug: string, locale: Locale): Promise<RecipeDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  return loadRecipe(createPublicClient(), { slug }, locale);
}

export async function loadRecipe(supabase: ContentClient, key: Key, locale: Locale): Promise<RecipeDetail | null> {
  const query = supabase
    .from("recipes")
    .select("id, slug, name_id, name_en, servings, minutes, dietary_tags, halal_status, regions(slug, name_id, name_en)");
  const { data: recipe, error } = await ("slug" in key ? query.eq("slug", key.slug) : query.eq("id", key.id)).maybeSingle();
  if (error) fail("recipe", error);
  if (!recipe) return null;
  const [ingredients, steps, sources, picture] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("id, name_id, name_en, amount, unit")
      .eq("recipe_id", recipe.id)
      .order("position"),
    supabase
      .from("recipe_steps")
      .select("id, step_no, text_id, text_en, timer_seconds")
      .eq("recipe_id", recipe.id)
      .order("step_no"),
    sourcesFor(supabase, "recipe", recipe.id),
    firstMedia(supabase, "recipe", recipe.id, locale),
  ]);
  if (ingredients.error) fail("ingredients", ingredients.error);
  if (steps.error) fail("steps", steps.error);
  const names = { id: recipe.name_id, en: recipe.name_en };
  return {
    id: recipe.id,
    slug: recipe.slug,
    title: pick(locale, names),
    altTitle: pick(locale === "en" ? "id" : "en", names),
    region: regionRef(locale, recipe.regions),
    servings: recipe.servings,
    minutes: recipe.minutes,
    dietaryTags: recipe.dietary_tags,
    halalStatus: recipe.halal_status,
    ingredients: ingredients.data.map((row) => ({
      id: row.id,
      name: pick(locale, { id: row.name_id, en: row.name_en }),
      amount: row.amount === null ? null : Number(row.amount),
      unit: row.unit,
    })),
    steps: steps.data.map((row) => ({
      id: row.id,
      number: row.step_no,
      text: pick(locale, { id: row.text_id, en: row.text_en }),
      timerSeconds: row.timer_seconds,
    })),
    sources,
    picture: localCover("recipe", recipe.slug, locale) ?? picture,
  };
}

export type CostumeDetail = {
  id: string;
  slug: string;
  title: string;
  altTitle: string;
  info: string;
  imageUrl: string | null;
  picture: MediaItem | null;
  region: { slug: string; name: string } | null;
  sources: SourceItem[];
};

export async function getCostume(slug: string, locale: Locale): Promise<CostumeDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  return loadCostume(createPublicClient(), { slug }, locale);
}

export async function loadCostume(supabase: ContentClient, key: Key, locale: Locale): Promise<CostumeDetail | null> {
  const query = supabase
    .from("costumes")
    .select("id, slug, name_id, name_en, info_id, info_en, reference_image_url, regions(slug, name_id, name_en)");
  const { data: costume, error } = await ("slug" in key ? query.eq("slug", key.slug) : query.eq("id", key.id)).maybeSingle();
  if (error) fail("costume", error);
  if (!costume) return null;
  const names = { id: costume.name_id, en: costume.name_en };
  const picture = localCover("costume", costume.slug, locale) ?? await firstMedia(supabase, "costume", costume.id, locale);
  return {
    id: costume.id,
    slug: costume.slug,
    title: pick(locale, names),
    altTitle: pick(locale === "en" ? "id" : "en", names),
    info: pick(locale, { id: costume.info_id, en: costume.info_en }),
    imageUrl: picture?.url ?? costume.reference_image_url,
    picture,
    region: regionRef(locale, costume.regions),
    sources: await sourcesFor(supabase, "costume", costume.id),
  };
}

export type CeremonyDetail = {
  id: string;
  slug: string;
  title: string;
  altTitle: string;
  /** When it is held, as the sources say it. Null when no source gives a time. */
  timing: string | null;
  summary: string;
  body: string;
  picture: MediaItem | null;
  region: { slug: string; name: string } | null;
  sources: SourceItem[];
};

export async function getCeremony(slug: string, locale: Locale): Promise<CeremonyDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  return loadCeremony(createPublicClient(), { slug }, locale);
}

/** One ceremony by slug or id, as the given client may see it. */
export async function loadCeremony(supabase: ContentClient, key: Key, locale: Locale): Promise<CeremonyDetail | null> {
  const query = supabase
    .from("ceremonies")
    .select("id, slug, name_id, name_en, summary_id, summary_en, timing_id, timing_en, body_id, body_en, regions(slug, name_id, name_en)");
  const { data: ceremony, error } = await ("slug" in key ? query.eq("slug", key.slug) : query.eq("id", key.id)).maybeSingle();
  if (error) fail("ceremony", error);
  if (!ceremony) return null;
  const names = { id: ceremony.name_id, en: ceremony.name_en };
  const timing = pick(locale, { id: ceremony.timing_id, en: ceremony.timing_en });
  return {
    id: ceremony.id,
    slug: ceremony.slug,
    title: pick(locale, names),
    altTitle: pick(locale === "en" ? "id" : "en", names),
    timing: timing || null,
    summary: pick(locale, { id: ceremony.summary_id, en: ceremony.summary_en }),
    body: pick(locale, { id: ceremony.body_id, en: ceremony.body_en }),
    picture: await firstMedia(supabase, "ceremony", ceremony.id, locale),
    region: regionRef(locale, ceremony.regions),
    sources: await sourcesFor(supabase, "ceremony", ceremony.id),
  };
}

/** Slugs of approved items, so detail pages can be prerendered. */
export async function getPublicSlugs(type: PublicType): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const table = type === "story" ? "stories" : type === "recipe" ? "recipes" : "costumes";
  const { data, error } = await createPublicClient().from(table).select("slug");
  if (error) fail(`${type} slugs`, error);
  return data.map((row) => row.slug);
}

/** Approved dress with a picture, for the try-on studio. Cached like the library. */
export type TryOnDress = { slug: string; title: string; parts: Record<"head" | "top" | "bottom", string>; credit: string; licence: string };

export async function getTryOnDresses(locale: Locale): Promise<TryOnDress[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTENT_TAG);
  const slugs = await getPublicSlugs("costume");
  const details = await Promise.all(slugs.map((slug) => getCostume(slug, locale)));
  return details.flatMap((dress) => {
    const parts = dress && costumeParts(dress.slug);
    return dress && parts ? [{ slug: dress.slug, title: dress.title, parts, credit: "Nusantara Culture Hub · OpenAI", licence: "Ilustrasi AI / AI illustration" }] : [];
  });
}
