import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SaveSlot } from "@/components/save-slot";
import { StoryView } from "@/components/views/story-view";
import { getStory } from "@/lib/content";
import { contentHref } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/stories/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const story = await getStory(slug, locale);
  return story ? { title: story.title, description: story.summary } : { title: dict.storyDetail.title };
}

// FR-04 text reader. Approved stories only (cached guest read); anything
// else gets the not-found UI. Audio narration arrives in Phase 3.
export default async function StoryPage({ params }: PageProps<"/[lang]/stories/[slug]">) {
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
        <Story params={params} />
      </Suspense>
    </div>
  );
}

async function Story({ params }: Pick<PageProps<"/[lang]/stories/[slug]">, "params">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const story = await getStory(slug, locale);
  if (!story) notFound();
  return <StoryView
      story={story}
      dict={dict}
      actions={<SaveSlot type="story" id={story.id} title={story.title} nextPath={contentHref("story", story.slug)} copy={dict.save} />}
    />;
}
