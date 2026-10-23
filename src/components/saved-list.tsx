import Link from "next/link";
import type { ComponentType } from "react";

import type { SavedItem } from "@/lib/bookmarks";
import { contentHref, fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { CostumeArt, RecipeArt, StoryArt } from "./line-art";
import { SaveButton } from "./save-button";

const ART: Record<SavedItem["card"]["type"], ComponentType<{ className?: string }>> = {
  story: StoryArt,
  recipe: RecipeArt,
  costume: CostumeArt,
};

const TINT = {
  story: "bg-tertiary-container text-on-tertiary-container",
  recipe: "bg-secondary-container text-on-secondary-container",
  costume: "bg-primary-container text-on-primary-container",
} as const;

/** Saved items as rows: a small plate, type and region, title, saved date, and the save toggle. */
export function SavedList({ items, dict, locale }: { items: SavedItem[]; dict: Dictionary; locale: Locale }) {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Jakarta" });
  return (
    <ul className="flex flex-col gap-3">
      {items.map(({ card, savedAt }) => {
        const Art = ART[card.type];
        return (
          <li key={`${card.type}-${card.id}`}>
            <article className="relative flex items-center gap-4 rounded border border-ink bg-surface-container-lowest p-3 shadow-1">
              <div aria-hidden="true" className={`hidden size-20 shrink-0 items-center justify-center rounded border border-ink sm:flex ${TINT[card.type]}`}>
                <Art className="h-14 w-16" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-label-sm uppercase text-secondary">
                  {dict.common.types[card.type]}
                  {card.region ? ` · ${card.region.name}` : ""}
                </p>
                {/* Content text is data: plain text nodes only. */}
                <h3 className="font-serif text-headline-md break-words text-on-surface">
                  <Link href={contentHref(card.type, card.slug)} className="rounded-sm hover:underline">
                    {card.title}
                  </Link>
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  <time dateTime={savedAt}>{fill(dict.me.savedAt, { date: date.format(new Date(savedAt)) })}</time>
                </p>
              </div>
              <SaveButton type={card.type} id={card.id} title={card.title} initialSaved copy={dict.save} />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
