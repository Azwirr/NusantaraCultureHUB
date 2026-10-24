import { BookOpen, MessageSquarePlus, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ContentCard } from "@/components/content-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SaveSlot } from "@/components/save-slot";
import { getLibrary, getRegions, type LibraryType } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { library } = await getDictionary();
  return { title: library.title, description: library.lead };
}

const TYPES: LibraryType[] = ["story", "recipe", "costume", "ceremony"];

function isType(value: unknown): value is LibraryType {
  return typeof value === "string" && (TYPES as string[]).includes(value);
}

function href(type: LibraryType | null, region: string | null): string {
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (region) query.set("region", region);
  const text = query.toString();
  return text ? `/library?${text}` : "/library";
}

// FR-02: approved stories, recipes and costumes, filtered by type and region.
// The filters are plain links, so they work without JavaScript.
export default async function LibraryPage({ searchParams }: PageProps<"/[lang]/library">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const { library, common } = dict;
  return (
    <div className="page-container py-10 md:py-16">
      <PageHeader kicker={library.kicker} title={library.title} lead={library.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {common.loading}
          </p>
        }
      >
        <Results dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function Chips({
  label,
  items,
}: {
  label: string;
  items: Array<{ key: string; label: string; href: string; current: boolean }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-sm uppercase text-on-surface-variant">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={item.current ? "true" : undefined}
              className={[
                "inline-flex min-h-12 items-center rounded-sm border px-4 text-label-md",
                item.current
                  ? "border-primary bg-primary text-on-primary"
                  : "border-ink bg-surface-container-lowest text-on-surface hover:bg-surface-container",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function Results({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: PageProps<"/[lang]/library">["searchParams"];
}) {
  const [query, cards, regions] = await Promise.all([searchParams, getLibrary(locale), getRegions(locale)]);
  const { library, common } = dict;
  const type = isType(query.type) ? query.type : null;
  const region = typeof query.region === "string" && regions.some((r) => r.slug === query.region) ? query.region : null;
  const visible = cards.filter((card) => (!type || card.type === type) && (!region || card.region?.slug === region));

  if (!cards.length) {
    return (
      <EmptyState
        icon={<BookOpen size={28} strokeWidth={1.75} />}
        title={library.emptyTitle}
        description={library.emptyBody}
        action={<RequestLink label={dict.requests.cta} />}
      />
    );
  }

  return (
    <>
      <nav aria-label={library.filtersLabel} className="mb-8 flex flex-col gap-5 rounded border border-ink bg-surface-container-low p-5">
        <Chips
          label={library.typeLabel}
          items={[
            { key: "all", label: library.all, href: href(null, region), current: !type },
            ...TYPES.map((value) => ({ key: value, label: common.types[value], href: href(value, region), current: type === value })),
          ]}
        />
        {regions.length ? (
          <Chips
            label={library.regionLabel}
            items={[
              { key: "all", label: library.all, href: href(type, null), current: !region },
              ...regions.map((r) => ({ key: r.slug, label: r.name, href: href(type, r.slug), current: region === r.slug })),
            ]}
          />
        ) : null}
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-body-md text-on-surface-variant">
          {fill(library.results, { n: visible.length })}
        </p>
        {type || region ? (
          <Link href="/library" className="inline-flex min-h-12 items-center gap-1.5 rounded px-2 text-label-md text-primary hover:underline">
            <X aria-hidden="true" size={16} strokeWidth={1.75} />
            {library.clear}
          </Link>
        ) : null}
      </div>

      {visible.length ? (
        <ul className="page-grid">
          {visible.map((card) => (
            <li key={`${card.type}-${card.id}`} className="col-span-4 md:col-span-4 lg:col-span-4">
              <ContentCard
                card={card}
                typeLabel={common.types[card.type]}
                minutesLabel={common.minutes}
                headingLevel={2}
                // After signing in, come back to the same filtered view.
                // Ceremonies cannot be saved yet.
                action={card.type === "ceremony" ? null : <SaveSlot type={card.type} id={card.id} title={card.title} nextPath={href(type, region)} copy={dict.save} />}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded border border-dashed border-outline bg-surface-container-low p-6 text-body-md text-on-surface-variant">
          {library.noMatch}
        </p>
      )}
      <div className="mt-10">
        <RequestLink label={dict.requests.cta} />
      </div>
    </>
  );
}

function RequestLink({ label }: { label: string }) {
  return (
    <Link href="/requests" className="inline-flex min-h-12 items-center gap-2 rounded px-2 text-label-md text-primary hover:underline">
      <MessageSquarePlus aria-hidden="true" size={18} strokeWidth={1.75} />
      {label}
    </Link>
  );
}
