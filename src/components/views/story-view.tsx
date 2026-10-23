import { AudioLines, ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { StoryDetail } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { SourceList } from "../source-list";
import { DetailHeader } from "./detail-header";

/**
 * The text reader for a story (FR-04, text part). Each chapter gives its
 * audio description first, then the illustration with its alt text, then the
 * text, so screen-reader users meet them in the order the PRD asks for.
 * Audio narration arrives in Phase 3.
 */
export function StoryView({ story, dict, actions }: { story: StoryDetail; dict: Dictionary; actions?: ReactNode }) {
  const copy = dict.storyDetail;
  return (
    <article>
      <DetailHeader
        kicker={dict.common.types.story}
        region={story.region}
        title={story.title}
        lead={story.summary}
        actions={actions}
      />

      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <p className="flex items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
            <AudioLines aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
            <span>{copy.audioComing}</span>
          </p>
          {story.chapters.length > 1 ? (
            <nav aria-labelledby="contents-heading">
              <h2 id="contents-heading" className="mb-2 text-label-sm uppercase text-on-surface-variant">
                {copy.contents}
              </h2>
              <ol className="flex flex-col gap-1">
                {story.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <a
                      href={`#bab-${chapter.number}`}
                      className="inline-flex min-h-12 items-center rounded px-2 text-body-md text-primary hover:bg-surface-container"
                    >
                      {fill(copy.chapter, { n: chapter.number })}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-14">
          {story.chapters.map((chapter) => (
            <section
              key={chapter.id}
              id={`bab-${chapter.number}`}
              aria-labelledby={`bab-${chapter.number}-heading`}
              className="rule-lead flex scroll-mt-6 flex-col gap-5"
            >
              <h2 id={`bab-${chapter.number}-heading`} className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">
                {fill(copy.chapter, { n: chapter.number })}
              </h2>
              <aside aria-label={copy.audioDescription} className="measure rounded border-l-4 border-primary bg-primary-container/50 p-4">
                <p className="mb-1 text-label-sm uppercase text-on-primary-container">{copy.audioDescription}</p>
                <p className="text-body-md text-on-surface">{chapter.audioDescription}</p>
              </aside>
              <figure className="measure overflow-hidden rounded border border-ink bg-surface-container-lowest">
                {chapter.imageUrl ? (
                  // Reviewed illustration; a plain img keeps remote hosts out of next/image config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={chapter.imageUrl} alt={chapter.imageAlt} className="h-auto w-full" loading="lazy" />
                ) : (
                  <div className="flex items-start gap-3 p-5 text-body-sm text-on-surface-variant">
                    <ImageIcon aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-secondary" />
                    <p>
                      {copy.illustrationPending} <span className="text-on-surface">{chapter.imageAlt}</span>
                    </p>
                  </div>
                )}
              </figure>
              <div className="measure font-serif text-story-body whitespace-pre-line text-on-surface">{chapter.text}</div>
            </section>
          ))}
          <SourceList sources={story.sources} copy={dict.common} />
        </div>
      </div>
    </article>
  );
}
