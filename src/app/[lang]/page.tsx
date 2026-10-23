import { ArrowRight, BookAudio, CookingPot, Languages, type LucideIcon, ShieldCheck, Shirt, UsersRound } from "lucide-react";
import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";

import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { BatikArt, CostumeArt, RecipeArt, RumahGadangArt, StoryArt, WayangArt } from "@/components/line-art";
import { MotifDivider } from "@/components/motif-divider";
import { SectionHeading } from "@/components/section-heading";
import { getLibrary, getRegions, type PublicType } from "@/lib/content";
import { contentHref } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

// FR-01: the three pillars, each linking into the library. One mode only.
const PILLARS: Array<{
  key: PublicType;
  href: string;
  icon: LucideIcon;
  art: ComponentType<{ className?: string }>;
  tile: string;
}> = [
  { key: "costume", href: "/library?type=costume", icon: Shirt, art: CostumeArt, tile: "bg-primary-container text-on-primary-container" },
  { key: "recipe", href: "/library?type=recipe", icon: CookingPot, art: RecipeArt, tile: "bg-secondary-container text-on-secondary-container" },
  { key: "story", href: "/library?type=story", icon: BookAudio, art: StoryArt, tile: "bg-tertiary-container text-on-tertiary-container" },
];

const TRUST: Array<{ key: "bilingual" | "sourced" | "reviewed"; icon: LucideIcon }> = [
  { key: "bilingual", icon: Languages },
  { key: "sourced", icon: ShieldCheck },
  { key: "reviewed", icon: UsersRound },
];

// Prerendered per language: the approved-content reads are cached ("use
// cache", tagged) and expire when a reviewer approves or unpublishes.
export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [library, regions] = await Promise.all([getLibrary(locale), getRegions(locale)]);
  const { home } = dict;
  const number = new Intl.NumberFormat(locale);
  const count = (type: PublicType) => library.filter((card) => card.type === type).length;
  const stats = [
    { key: "story", value: count("story") },
    { key: "recipe", value: count("recipe") },
    { key: "costume", value: count("costume") },
    { key: "region", value: regions.length },
  ] as const;
  const live = library.length > 0;
  const featured = library.find((card) => card.type === "story");

  return (
    <>
      <section aria-labelledby="hero-title" className="overflow-hidden border-b border-ink bg-surface-container-low">
        <div className="page-container page-grid items-center gap-y-10 py-12 md:py-20">
          <div className="rise col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-7">
            <p className="flex items-center gap-2 text-label-sm uppercase text-secondary">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
              {home.kicker}
            </p>
            <h1 id="hero-title" className="font-serif text-display-mobile text-on-surface md:text-display">
              {home.title}
            </h1>
            <p className="measure text-body-lg text-on-surface-variant">{home.lead}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/library">
                {home.primaryCta}
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
              </ButtonLink>
              <ButtonLink href="/regions" variant="secondary">
                {home.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          {/* Collage of project line art. Decorative: hidden from assistive tech. */}
          <div aria-hidden="true" className="relative col-span-4 hidden h-80 md:col-span-8 md:block lg:col-span-5 lg:h-[26rem]">
            <div className="rise absolute top-0 left-0 w-[62%] rounded border border-ink bg-surface-container-lowest p-3 text-secondary shadow-2 [--rise-delay:80ms]">
              <RumahGadangArt className="h-auto w-full" />
            </div>
            <div className="rise absolute top-6 right-0 w-[30%] rounded border border-ink bg-primary-container p-3 text-on-primary-container shadow-2 [--rise-delay:160ms]">
              <WayangArt className="h-auto w-full" />
            </div>
            <div className="rise absolute bottom-0 left-[12%] w-[64%] rounded border border-ink bg-secondary-container p-3 text-on-secondary-container shadow-2 [--rise-delay:240ms]">
              <BatikArt className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      <section aria-label={home.statsLabel} className="border-b border-ink bg-surface">
        <div className="page-container py-8">
          {live ? (
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.key} className="rule-lead flex flex-col gap-1">
                  <dd className="order-first font-serif text-numeral text-primary tabular-nums">{number.format(stat.value)}</dd>
                  <dt className="text-label-md text-on-surface-variant">{home.stats[stat.key]}</dt>
                </div>
              ))}
            </dl>
          ) : (
            <p className="measure flex items-start gap-3 text-body-md text-on-surface-variant">
              <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
              <span>{home.statsPending}</span>
            </p>
          )}
        </div>
      </section>

      <div className="page-container flex flex-col gap-20 py-14 md:py-20">
        {featured ? (
          <section aria-labelledby="featured-title" className="page-grid items-center gap-y-6">
            <div className="col-span-4 rounded border border-ink bg-tertiary-container p-6 text-on-tertiary-container shadow-2 md:col-span-3 lg:col-span-5">
              <StoryArt className="mx-auto h-48 w-full" />
            </div>
            <div className="col-span-4 flex flex-col gap-3 md:col-span-5 lg:col-span-7">
              <p className="text-label-sm uppercase text-secondary">
                {home.featuredKicker}
                {featured.region ? ` · ${featured.region.name}` : ""}
              </p>
              {/* Content text is data: plain text nodes only. */}
              <h2 id="featured-title" className="font-serif text-headline-xl-mobile text-on-surface md:text-headline-xl">
                {featured.title}
              </h2>
              {featured.summary ? <p className="measure text-body-lg text-on-surface-variant">{featured.summary}</p> : null}
              <div className="pt-2">
                <ButtonLink href={contentHref("story", featured.slug)}>
                  {home.featuredCta}
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                </ButtonLink>
              </div>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="pillars-title">
          <SectionHeading id="pillars-title" title={home.pillarsHeading} lead={home.pillarsLead} />
          <ul className="page-grid">
            {PILLARS.map((pillar, index) => {
              const copy = home.pillars[pillar.key];
              const Icon = pillar.icon;
              const Art = pillar.art;
              return (
                <li
                  key={pillar.key}
                  className="rise col-span-4 md:col-span-8 lg:col-span-4"
                  style={{ "--rise-delay": `${index * 80}ms` } as CSSProperties}
                >
                  <Card as="article" className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start gap-3">
                      <span aria-hidden="true" className={`flex size-12 shrink-0 items-center justify-center rounded border border-ink ${pillar.tile}`}>
                        <Icon size={24} strokeWidth={1.75} />
                      </span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-label-sm uppercase text-secondary">{copy.kicker}</p>
                        <h3 className="font-serif text-headline-md text-on-surface">{copy.title}</h3>
                        <p className="font-serif text-body-sm font-light italic text-on-surface-variant">{copy.subtitle}</p>
                      </div>
                    </div>
                    <div className={`rounded border border-ink px-4 py-3 ${pillar.tile}`}>
                      <Art className="mx-auto h-32 w-full max-w-72" />
                    </div>
                    <p className="flex-1 text-body-md text-on-surface-variant">{copy.body}</p>
                    <ButtonLink href={pillar.href} className="w-full">
                      {copy.cta}
                      <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="regions-title" className="page-grid items-center gap-y-6">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <SectionHeading id="regions-title" kicker={home.regionsKicker} title={home.regionsTitle} lead={home.regionsBody} />
            {regions.length ? (
              <ul className="mb-6 flex flex-wrap gap-2">
                {regions.map((region) => (
                  <li key={region.slug}>
                    <Link
                      href={`/regions/${region.slug}`}
                      className="inline-flex min-h-12 items-center rounded-sm border border-ink bg-surface-container-lowest px-4 text-label-md text-on-surface hover:bg-surface-container"
                    >
                      {region.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <ButtonLink href="/regions" variant="secondary">
              {home.regionsCta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
            </ButtonLink>
          </div>
          <div aria-hidden="true" className="col-span-4 rounded border border-ink bg-surface-container-low p-6 text-secondary md:col-span-8 lg:col-span-6">
            <RumahGadangArt className="h-auto w-full" />
          </div>
        </section>

        <section aria-labelledby="trust-title" className="rounded border border-ink bg-inverse-surface p-6 text-inverse-on-surface md:p-10">
          <p className="mb-2 text-label-sm uppercase opacity-80">{home.trustKicker}</p>
          <h2 id="trust-title" className="mb-8 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-lg">
            {home.trustTitle}
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {TRUST.map((step, index) => {
              const Icon = step.icon;
              const copy = home.trustSteps[step.key];
              return (
                <li key={step.key} className="flex flex-col gap-3 border-t border-current/30 pt-4">
                  <p className="flex items-center gap-3">
                    <span className="font-serif text-numeral leading-none opacity-70" aria-hidden="true">
                      {index + 1}
                    </span>
                    <Icon aria-hidden="true" size={24} strokeWidth={1.75} />
                  </p>
                  <h3 className="font-serif text-headline-md">{copy.title}</h3>
                  <p className="text-body-md opacity-90">{copy.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <MotifDivider />
      </div>
    </>
  );
}
