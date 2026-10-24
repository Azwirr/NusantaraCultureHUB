import { ArrowLeft, ArrowRight, MapPinned, MessageSquarePlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ButtonLink } from "@/components/button";
import { ContentCard } from "@/components/content-card";
import { EmptyState } from "@/components/empty-state";
import { SaveSlot } from "@/components/save-slot";
import { SectionHeading } from "@/components/section-heading";
import { DetailHeader } from "@/components/views/detail-header";
import { getLibrary, getRegions, type LibraryType } from "@/lib/content";
import { fill } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getIsland, ISLANDS, onIsland } from "@/lib/map/islands";
import { PROVINCE_NAMES } from "@/lib/map/province-names";

export async function generateMetadata({ params }: PageProps<"/[lang]/regions/island/[island]">): Promise<Metadata> {
  const [{ island: slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const island = getIsland(slug);
  return island ? { title: island.name[locale], description: island.note[locale] } : { title: dict.islandDetail.kicker };
}

// FR-16: the region map opens one page per island, with its approved regions
// and their stories, recipes and dress. It exists before anything is approved.
export default async function IslandPage({ params }: PageProps<"/[lang]/regions/island/[island]">) {
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
        <IslandView params={params} />
      </Suspense>
    </div>
  );
}

const SECTIONS: LibraryType[] = ["story", "recipe", "costume", "ceremony"];

async function IslandView({ params }: Pick<PageProps<"/[lang]/regions/island/[island]">, "params">) {
  const [{ island: slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const island = getIsland(slug);
  if (!island) notFound();
  const [allRegions, library] = await Promise.all([getRegions(locale), getLibrary(locale)]);
  const regions = allRegions.filter((region) => onIsland(island, region.provinceCodes));
  const regionSlugs = new Set(regions.map((region) => region.slug));
  const items = library.filter((card) => card.region && regionSlugs.has(card.region.slug));
  const { islandDetail: copy, regions: regionCopy, regionDetail, common } = dict;
  const name = island.name[locale];
  const provinces = island.provinces.flatMap((code) => (PROVINCE_NAMES[code] ? [PROVINCE_NAMES[code][locale]] : []));

  return (
    <>
      <Link href="/regions" className="mb-6 inline-flex min-h-12 items-center gap-2 rounded text-label-md text-primary hover:underline">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        {copy.back}
      </Link>
      <DetailHeader kicker={copy.kicker} region={null} title={name} lead={island.note[locale]}>
        <p className="max-w-3xl text-body-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{copy.provincesLabel}:</span> {provinces.join(", ")}
        </p>
      </DetailHeader>

      {regions.length ? (
        <div className="flex flex-col gap-16">
          <section aria-labelledby="island-regions">
            <SectionHeading id="island-regions" title={copy.regionsHeading} />
            <ul className="page-grid">
              {regions.map((region) => (
                <li key={region.slug} className="col-span-4 md:col-span-4 lg:col-span-4">
                  <article className="group relative flex h-full flex-col gap-3 rounded border border-ink bg-surface-container-lowest p-5 shadow-1 hover:shadow-2">
                    {/* Content text is data: plain text nodes only. */}
                    <h3 className="font-serif text-headline-md text-on-surface">
                      <Link href={`/regions/${region.slug}`} className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:underline">
                        {region.name}
                      </Link>
                    </h3>
                    {region.summary ? <p className="line-clamp-3 text-body-md text-on-surface-variant">{region.summary}</p> : null}
                    <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-body-sm text-on-surface-variant">
                      {SECTIONS.map((type) => (
                        <li key={type}>{fill(regionCopy.counts[type], { n: region.counts[type] })}</li>
                      ))}
                    </ul>
                    <span aria-hidden="true" className="flex items-center gap-1.5 text-label-md text-primary">
                      {regionCopy.open}
                      <ArrowRight size={16} strokeWidth={1.75} />
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          </section>

          {SECTIONS.map((type) => {
            const cards = items.filter((card) => card.type === type);
            return (
              <section key={type} aria-labelledby={`section-${type}`}>
                <SectionHeading id={`section-${type}`} title={regionDetail.sections[type]} />
                {cards.length ? (
                  <ul className="page-grid">
                    {cards.map((card) => (
                      <li key={card.id} className="col-span-4 md:col-span-4 lg:col-span-4">
                        <ContentCard
                          card={card}
                          typeLabel={common.types[type]}
                          minutesLabel={common.minutes}
                          // Ceremonies cannot be saved yet.
                          action={
                            card.type === "ceremony" ? null : (
                              <SaveSlot type={card.type} id={card.id} title={card.title} nextPath={`/regions/island/${island.slug}`} copy={dict.save} />
                            )
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
                    {regionDetail.sectionEmpty}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MapPinned size={28} strokeWidth={1.75} />}
          title={fill(copy.emptyTitle, { island: name })}
          description={copy.emptyBody}
          action={
            <ButtonLink href="/requests" variant="secondary">
              <MessageSquarePlus aria-hidden="true" size={18} strokeWidth={1.75} />
              {copy.request}
            </ButtonLink>
          }
        />
      )}

      <nav aria-labelledby="other-islands" className="mt-16">
        <h2 id="other-islands" className="rule-lead mb-4 font-serif text-headline-md text-on-surface">
          {copy.otherIslands}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {ISLANDS.filter((other) => other.slug !== island.slug).map((other) => (
            <li key={other.slug}>
              <Link
                href={`/regions/island/${other.slug}`}
                className="inline-flex min-h-12 items-center rounded-full border border-ink bg-surface-container-lowest px-4 text-label-md text-on-surface hover:bg-surface-container"
              >
                {other.name[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
