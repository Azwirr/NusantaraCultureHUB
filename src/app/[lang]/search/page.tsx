import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { groupHits, normalizeQuery, searchContent } from "@/lib/search";

export async function generateMetadata(): Promise<Metadata> {
  const { search } = await getDictionary();
  return { title: search.title, robots: { index: false, follow: true } };
}

// FR-14: shareable /search?q= results, grouped by type. Works without
// JavaScript: the form is a plain GET.
export default async function SearchPage({ searchParams }: PageProps<"/[lang]/search">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const { search } = dict;
  return (
    <div className="page-container py-10 md:py-16">
      <PageHeader kicker={search.label} title={search.title} lead={search.lead} />
      <Suspense fallback={<SearchForm dict={dict} value="" />}>
        <Results dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function SearchForm({ dict, value }: { dict: Dictionary; value: string }) {
  const { search } = dict;
  return (
    <form role="search" action="/search" className="mb-10 flex max-w-2xl flex-wrap items-end gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor="search-page-q" className="text-label-md text-on-surface">
          {search.label}
        </label>
        <input
          id="search-page-q"
          name="q"
          type="search"
          defaultValue={value}
          maxLength={100}
          autoComplete="off"
          placeholder={search.placeholder}
          className="min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-4 text-body-lg text-on-surface"
        />
      </div>
      <Button type="submit">
        <Search aria-hidden="true" size={18} strokeWidth={1.75} />
        {search.submit}
      </Button>
    </form>
  );
}

async function Results({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: PageProps<"/[lang]/search">["searchParams"];
}) {
  const query = normalizeQuery((await searchParams).q);
  const hits = query.length >= 2 ? await searchContent(query, locale, 40) : [];
  const groups = groupHits(hits);
  const { search } = dict;

  return (
    <>
      <SearchForm dict={dict} value={query} />
      {query.length < 2 ? (
        <p className="text-body-md text-on-surface-variant">{search.hint}</p>
      ) : (
        <>
          {/* The search term is user input: it is only ever a text node. */}
          <p role="status" className={`${hits.length ? "mb-8" : "mb-1"} text-body-lg text-on-surface`}>
            {hits.length ? fill(search.resultsFor, { n: hits.length, q: query }) : fill(search.noResults, { q: query })}
          </p>
          {/* The message suggests the library: offer the way there. */}
          {hits.length ? null : (
            <Link href="/library" className="mb-8 inline-flex min-h-12 items-center text-label-md text-primary underline">
              {dict.common.openLibrary}
            </Link>
          )}
          <div className="flex flex-col gap-10">
            {groups.map((group) => (
              <section key={group.type} aria-labelledby={`group-${group.type}`}>
                <h2 id={`group-${group.type}`} className="rule-lead mb-4 font-serif text-headline-md text-on-surface">
                  {search.groups[group.type]}
                </h2>
                <ul className="flex flex-col gap-3">
                  {group.hits.map((hit) => (
                    <li key={hit.id}>
                      <Link
                        href={hit.href}
                        className="flex flex-col gap-1 rounded border border-ink bg-surface-container-lowest p-4 shadow-1 hover:shadow-2"
                      >
                        <span className="font-serif text-headline-md text-on-surface">{hit.title}</span>
                        {hit.regionName ? <span className="text-label-sm uppercase text-secondary">{hit.regionName}</span> : null}
                        {hit.summary ? <span className="line-clamp-2 text-body-md text-on-surface-variant">{hit.summary}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
