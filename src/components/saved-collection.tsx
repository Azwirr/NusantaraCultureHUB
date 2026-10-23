import { Info } from "lucide-react";
import Link from "next/link";

import type { SavedItem } from "@/lib/bookmarks";
import { countSaved } from "@/lib/bookmarks";
import type { PublicType } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { SavedList } from "./saved-list";

export const SAVED_TYPES: PublicType[] = ["story", "recipe", "costume"];

/** Reads ?type= into one of the saved types, or null for all of them. */
export function parseSavedType(value: string | string[] | undefined): PublicType | null {
  return SAVED_TYPES.find((type) => type === value) ?? null;
}

/** The member's collection: type filter chips, then the saved rows. */
export function SavedCollection({
  items,
  type,
  dict,
  locale,
}: {
  items: SavedItem[];
  type: PublicType | null;
  dict: Dictionary;
  locale: Locale;
}) {
  const { saved, common } = dict;
  if (!items.length) {
    return (
      <p className="rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
        {saved.empty}
      </p>
    );
  }

  const counts = countSaved(items);
  const visible = type ? items.filter((item) => item.card.type === type) : items;
  const chips = [
    { key: "all", label: `${saved.all} (${items.length})`, href: "/me", current: !type },
    ...SAVED_TYPES.map((value) => ({
      key: value,
      label: `${common.types[value]} (${counts[value]})`,
      href: `/me?type=${value}`,
      current: type === value,
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label={saved.filtersLabel}>
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.href}
                scroll={false}
                aria-current={chip.current ? "true" : undefined}
                className={[
                  "inline-flex min-h-12 items-center rounded-full border px-4 text-label-md",
                  chip.current
                    ? "border-primary bg-primary text-on-primary"
                    : "border-ink bg-surface-container-lowest text-on-surface hover:bg-surface-container",
                ].join(" ")}
              >
                {chip.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {visible.length ? (
        <SavedList items={visible} dict={dict} locale={locale} />
      ) : (
        <p className="rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
          {saved.noMatch}
        </p>
      )}
      <p className="flex items-start gap-3 text-body-sm text-on-surface-variant">
        <Info aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        <span>{saved.hiddenNote}</span>
      </p>
    </div>
  );
}
