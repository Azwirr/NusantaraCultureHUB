import { ArrowLeft, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { SavedList } from "@/components/saved-list";
import { requireUser } from "@/lib/auth";
import { countSaved, getSavedItems } from "@/lib/bookmarks";
import type { PublicType } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { saved } = await getDictionary();
  return { title: saved.title, robots: { index: false, follow: false } };
}

const TYPES: PublicType[] = ["story", "recipe", "costume"];

export default async function SavedPage({ searchParams }: PageProps<"/[lang]/me/saved">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <Link href="/me" className="mb-4 inline-flex min-h-12 items-center gap-2 rounded text-label-md text-primary hover:underline">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        {dict.saved.back}
      </Link>
      <PageHeader kicker={dict.saved.kicker} title={dict.saved.title} lead={dict.saved.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.me.loading}
          </p>
        }
      >
        <Saved dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Members only (the proxy and requireUser send guests to /login). */
async function Saved({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: PageProps<"/[lang]/me/saved">["searchParams"];
}) {
  await requireUser("/me/saved");
  const [query, items] = await Promise.all([searchParams, getSavedItems(locale)]);
  const type = TYPES.find((value) => value === query.type) ?? null;
  const counts = countSaved(items);
  const visible = type ? items.filter((item) => item.card.type === type) : items;
  const { saved, common } = dict;
  const chips = [
    { key: "all", label: `${saved.all} (${items.length})`, href: "/me/saved", current: !type },
    ...TYPES.map((value) => ({
      key: value,
      label: `${common.types[value]} (${counts[value]})`,
      href: `/me/saved?type=${value}`,
      current: type === value,
    })),
  ];

  if (!items.length) {
    return (
      <p className="max-w-2xl rounded border border-dashed border-outline bg-surface-container-low p-6 text-body-md text-on-surface-variant">
        {saved.empty}
      </p>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <nav aria-label={saved.filtersLabel}>
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <Link
                href={chip.href}
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
