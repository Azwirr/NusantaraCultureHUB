import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContentCard } from "@/components/content-card";
import { SaveSlot } from "@/components/save-slot";
import { SectionHeading } from "@/components/section-heading";
import { DetailHeader } from "@/components/views/detail-header";
import { getRegion, type PublicType } from "@/lib/content";
import { fill } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/regions/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const region = await getRegion(slug, locale);
  return region ? { title: region.name, description: region.summary ?? undefined } : { title: dict.regionDetail.title };
}

// FR-03: one page per approved region with its stories, recipes and dress.
export default async function RegionPage({ params }: PageProps<"/[lang]/regions/[slug]">) {
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
        <Region params={params} />
      </Suspense>
    </div>
  );
}

const SECTIONS: PublicType[] = ["story", "recipe", "costume"];

async function Region({ params }: Pick<PageProps<"/[lang]/regions/[slug]">, "params">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const region = await getRegion(slug, locale);
  if (!region) notFound();
  const { regionDetail: copy, regions, common } = dict;

  return (
    <>
      <Link href="/regions" className="mb-6 inline-flex min-h-12 items-center gap-2 rounded text-label-md text-primary hover:underline">
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        {common.backToRegions}
      </Link>
      <DetailHeader kicker={copy.kicker} region={null} title={region.name} lead={region.summary ?? undefined}>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-body-md text-on-surface-variant">
          {SECTIONS.map((type) => (
            <li key={type}>{fill(regions.counts[type], { n: region.counts[type] })}</li>
          ))}
        </ul>
      </DetailHeader>

      <div className="flex flex-col gap-16">
        {SECTIONS.map((type) => {
          const items = region.items.filter((card) => card.type === type);
          return (
            <section key={type} aria-labelledby={`section-${type}`}>
              <SectionHeading id={`section-${type}`} title={copy.sections[type]} />
              {items.length ? (
                <ul className="page-grid">
                  {items.map((card) => (
                    <li key={card.id} className="col-span-4 md:col-span-4 lg:col-span-4">
                      <ContentCard
                        card={{ ...card, region: null }}
                        typeLabel={common.types[type]}
                        minutesLabel={common.minutes}
                        action={
                          <SaveSlot type={card.type} id={card.id} title={card.title} nextPath={`/regions/${region.slug}`} copy={dict.save} />
                        }
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
                  {copy.sectionEmpty}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
