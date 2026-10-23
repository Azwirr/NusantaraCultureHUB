import { ArrowRight, BookAudio, CookingPot, type LucideIcon, ShieldCheck, Shirt } from "lucide-react";
import type { ComponentType } from "react";

import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { CostumeArt, HeroArt, RecipeArt, StoryArt } from "@/components/line-art";
import { MotifDivider } from "@/components/motif-divider";
import { getDictionary } from "@/lib/i18n/dictionaries";

type PillarKey = "costume" | "recipe" | "story";

// FR-01: the three pillars, each linking into the library. One mode only.
const PILLARS: Array<{
  key: PillarKey;
  href: string;
  icon: LucideIcon;
  art: ComponentType<{ className?: string }>;
  tile: string;
}> = [
  {
    key: "costume",
    href: "/library?type=costume",
    icon: Shirt,
    art: CostumeArt,
    tile: "bg-primary-container text-on-primary-container",
  },
  {
    key: "recipe",
    href: "/library?type=recipe",
    icon: CookingPot,
    art: RecipeArt,
    tile: "bg-secondary-container text-on-secondary-container",
  },
  {
    key: "story",
    href: "/library?type=story",
    icon: BookAudio,
    art: StoryArt,
    tile: "bg-tertiary-container text-on-tertiary-container",
  },
];

export default async function HomePage() {
  const { home } = await getDictionary();

  return (
    <>
      <section aria-labelledby="hero-title" className="border-b border-ink bg-surface-container-low/80">
        <div className="page-container page-grid items-center py-10 md:py-14">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-5 lg:col-span-7">
            <p className="flex items-center gap-2 text-label-sm uppercase text-secondary">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
              {home.kicker}
            </p>
            <h1 id="hero-title" className="font-serif text-headline-xl-mobile text-on-surface md:text-headline-xl">
              {home.title}
            </h1>
            <p className="max-w-prose text-body-lg text-on-surface-variant">{home.lead}</p>
            <div className="pt-2">
              <ButtonLink href="/library">
                {home.primaryCta}
                <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
              </ButtonLink>
            </div>
          </div>
          <div className="hidden md:col-span-3 md:block lg:col-span-5">
            <div className="rounded border border-ink bg-surface-container-lowest p-3 text-secondary shadow-2">
              <HeroArt className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      <div className="page-container py-10 md:py-14">
        <MotifDivider className="mb-8" />

        <section aria-labelledby="pillars-title">
          <h2 id="pillars-title" className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {home.pillarsHeading}
          </h2>
          <p className="mt-2 text-body-lg text-on-surface-variant">{home.pillarsLead}</p>

          <ul className="page-grid mt-6">
            {PILLARS.map((pillar) => {
              const copy = home.pillars[pillar.key];
              const Icon = pillar.icon;
              const Art = pillar.art;
              return (
                <li key={pillar.key} className="col-span-4 md:col-span-8 lg:col-span-4">
                  <Card as="article" className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex size-12 shrink-0 items-center justify-center rounded border border-ink ${pillar.tile}`}
                      >
                        <Icon size={24} strokeWidth={1.75} />
                      </span>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <p className="text-label-sm uppercase text-secondary">{copy.kicker}</p>
                        <h3 className="font-serif text-headline-md text-on-surface">{copy.title}</h3>
                        <p className="font-serif text-body-sm font-light italic text-on-surface-variant">
                          {copy.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="rounded border border-ink bg-surface-container-low px-4 py-3 text-secondary">
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

        <Card
          as="aside"
          surface="low"
          aria-labelledby="review-note-title"
          className="mt-10 flex items-start gap-4 p-5"
        >
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded border border-ink bg-surface-container-lowest text-primary">
            <ShieldCheck size={22} strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="review-note-title" className="font-serif text-headline-md text-on-surface">
              {home.reviewTitle}
            </h2>
            <p className="text-body-md text-on-surface-variant">{home.reviewBody}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
