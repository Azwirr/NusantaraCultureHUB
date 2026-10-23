import { ArrowRight, LayoutList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RegionMap } from "@/components/region-map";
import { getRegions } from "@/lib/content";
import { fill } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { regions } = await getDictionary();
  return { title: regions.title, description: regions.lead };
}

// FR-03 / FR-16: the navigation map, then the list of approved regions. The
// list is the full alternative to the map, on every screen size.
export default async function RegionsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const { regions: copy, common } = dict;
  const regions = await getRegions(locale);

  return (
    <div className="page-container py-10 md:py-16">
      <PageHeader kicker={copy.kicker} title={copy.title} lead={copy.lead} />
      <section aria-labelledby="map-heading" className="mb-14">
        <h2 id="map-heading" className="sr-only">
          {dict.map.heading}
        </h2>
        <RegionMap regions={regions} locale={locale} copy={dict.map} />
      </section>
      {regions.length ? (
        <section aria-labelledby="region-list-heading">
          <h2 id="region-list-heading" className="rule-lead mb-6 font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {copy.listHeading}
          </h2>
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
                  {region.summary ? <p className="line-clamp-4 text-body-md text-on-surface-variant">{region.summary}</p> : null}
                  <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-body-sm text-on-surface-variant">
                    {(["story", "recipe", "costume"] as const).map((type) => (
                      <li key={type}>{fill(copy.counts[type], { n: region.counts[type] })}</li>
                    ))}
                  </ul>
                  <span aria-hidden="true" className="flex items-center gap-1.5 text-label-md text-primary">
                    {copy.open}
                    <ArrowRight size={16} strokeWidth={1.75} />
                  </span>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          icon={<LayoutList size={28} strokeWidth={1.75} />}
          title={copy.emptyTitle}
          description={copy.emptyBody}
          action={
            <ButtonLink href="/library" variant="secondary">
              {common.openLibrary}
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
