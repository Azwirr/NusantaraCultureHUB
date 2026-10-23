import { Clock } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import type { ContentCard as Card } from "@/lib/content";
import { contentHref, fill } from "@/lib/format";

import { CostumeArt, RecipeArt, StoryArt } from "./line-art";
import { CoverArt } from "./cover-art";

const ART: Record<Card["type"], ComponentType<{ className?: string }>> = {
  story: StoryArt,
  recipe: RecipeArt,
  costume: CostumeArt,
};

const TINT: Record<Card["type"], string> = {
  story: "bg-tertiary-container text-on-tertiary-container",
  recipe: "bg-secondary-container text-on-secondary-container",
  costume: "bg-primary-container text-on-primary-container",
};

/**
 * Editorial card for one approved item. The whole card is one link (the
 * title's link stretches over it); `action` (the save button) sits above
 * that link so it stays its own control.
 */
export function ContentCard({
  card,
  typeLabel,
  minutesLabel,
  action,
  headingLevel = 3,
}: {
  card: Card;
  typeLabel: string;
  minutesLabel: string;
  action?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Art = ART[card.type];
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded border border-ink bg-surface-container-lowest shadow-1 transition-shadow hover:shadow-2">
      {card.picture ? (
        <CoverArt cover={card.picture} compact />
      ) : (
        <div className={`border-b border-ink px-6 py-4 ${TINT[card.type]}`}>
          <Art className="mx-auto h-24 w-full max-w-56" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-label-sm uppercase text-secondary">
          {typeLabel}
          {card.region ? ` · ${card.region.name}` : ""}
        </p>
        {/* Content text is data: plain text nodes only. */}
        <Heading className="font-serif text-headline-md text-on-surface">
          <Link
            href={contentHref(card.type, card.slug)}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:underline"
          >
            {card.title}
          </Link>
        </Heading>
        {card.summary ? <p className="line-clamp-3 text-body-md text-on-surface-variant">{card.summary}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {card.minutes ? (
            <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <Clock aria-hidden="true" size={16} strokeWidth={1.75} />
              {fill(minutesLabel, { n: card.minutes })}
            </p>
          ) : (
            <span />
          )}
          {action ? <div className="relative z-10">{action}</div> : null}
        </div>
      </div>
    </article>
  );
}
