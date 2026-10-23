import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { TryOnCamera } from "@/components/try-on-camera";
import { getTryOnDresses } from "@/lib/content";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { tryOn } = await getDictionary();
  return { title: tryOn.title, description: tryOn.lead };
}

// PRD privacy rule: try-on photos are processed in the browser and never
// uploaded. The camera and pose model run entirely in the browser.
export default async function TryOnPage() {
  const [{ tryOn, common }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const dresses = await getTryOnDresses(locale);
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={tryOn.kicker} title={tryOn.title} lead={tryOn.lead} />

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

        <Card as="section" aria-label={tryOn.title} className="col-span-4 flex flex-col gap-4 p-5 md:col-span-8 lg:col-span-7">
          <Suspense fallback={<p>{common.loading}</p>}>
            <TryOnCamera dresses={dresses} copy={{ ...tryOn, ...common }} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
