import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { PreviewBanner } from "@/components/views/detail-header";
import { CeremonyView } from "@/components/views/ceremony-view";
import { CostumeView } from "@/components/views/costume-view";
import { RecipeView } from "@/components/views/recipe-view";
import { StoryView } from "@/components/views/story-view";
import { requireStaff } from "@/lib/auth";
import { loadCeremony, loadCostume, loadRecipe, loadStory } from "@/lib/content";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { common } = await getDictionary();
  return { title: common.previewLink, robots: { index: false, follow: false } };
}

/**
 * Staff only: a draft rendered with the public template, through the
 * reviewer's own session (RLS shows staff the drafts). Never cached, never
 * linked from public pages.
 */
export default async function PreviewPage({ params }: PageProps<"/[lang]/review/preview/[type]/[id]">) {
  const dict = await getDictionary();
  return (
    <div className="page-container py-10 md:py-16">
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.common.loading}
          </p>
        }
      >
        <Preview params={params} />
      </Suspense>
    </div>
  );
}

const PREVIEW_TYPES = ["story", "recipe", "costume", "ceremony"] as const;

async function Preview({ params }: Pick<PageProps<"/[lang]/review/preview/[type]/[id]">, "params">) {
  const [{ type, id }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  if (!(PREVIEW_TYPES as readonly string[]).includes(type) || !z.guid().safeParse(id).success) notFound();
  await requireStaff(`/review/preview/${type}/${id}`);
  const supabase = await createClient();
  const banner = <PreviewBanner text={dict.common.previewBanner} />;

  if (type === "story") {
    const story = await loadStory(supabase, { id }, locale);
    if (!story) notFound();
    return (
      <>
        {banner}
        <StoryView story={story} dict={dict} />
      </>
    );
  }
  if (type === "recipe") {
    const recipe = await loadRecipe(supabase, { id }, locale);
    if (!recipe) notFound();
    return (
      <>
        {banner}
        <RecipeView recipe={recipe} dict={dict} locale={locale} />
      </>
    );
  }
  if (type === "ceremony") {
    const ceremony = await loadCeremony(supabase, { id }, locale);
    if (!ceremony) notFound();
    return (
      <>
        {banner}
        <CeremonyView ceremony={ceremony} dict={dict} />
      </>
    );
  }
  const costume = await loadCostume(supabase, { id }, locale);
  if (!costume) notFound();
  return (
    <>
      {banner}
      <CostumeView costume={costume} dict={dict} />
    </>
  );
}
