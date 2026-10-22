import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { CostumeArt } from "@/components/line-art";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { tryOn } = await getDictionary();
  return { title: tryOn.title, description: tryOn.lead };
}

// Phase 1 placeholder: no camera, pose detection or image code. PRD privacy
// rule: try-on photos are processed in the browser and never uploaded.
export default async function TryOnPage() {
  const { tryOn, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={tryOn.kicker} title={tryOn.title} lead={tryOn.lead}>
        <div>
          <Chip tone="neutral" icon={<Clock size={14} strokeWidth={1.75} />}>
            {common.comingSoon}
          </Chip>
        </div>
      </PageHeader>

      <div className="page-grid">
        <Card
          as="section"
          surface="primary"
          aria-labelledby="privacy-title"
          className="col-span-4 flex items-start gap-4 p-5 md:col-span-8 lg:col-span-5"
        >
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded border border-ink bg-surface-container-lowest text-primary"
          >
            <ShieldCheck size={24} strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="privacy-title" className="font-serif text-headline-md">
              {tryOn.privacyTitle}
            </h2>
            <p className="text-body-md">{tryOn.privacyBody}</p>
          </div>
        </Card>

        <Card className="col-span-4 flex flex-col gap-4 p-5 md:col-span-8 lg:col-span-7">
          <div className="rounded border border-ink bg-surface-container-low px-4 py-3 text-secondary">
            <CostumeArt className="mx-auto h-32 w-full max-w-72" />
          </div>
          <p className="text-body-lg text-on-surface">{tryOn.statusBody}</p>
          <div>
            <ButtonLink href="/library?type=costume">
              {tryOn.cta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
