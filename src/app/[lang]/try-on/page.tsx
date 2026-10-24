import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { PortraitStudio } from "@/components/portrait-studio";
import { getSessionUser } from "@/lib/auth";
import { getTryOnDresses } from "@/lib/content";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { tryOn } = await getDictionary();
  return { title: tryOn.title, description: tryOn.lead };
}

// The owner replaced the manual compositor with generated portraits. One face
// photo is sent only after sign-in, consent and Generate; no photo is stored.
export default async function TryOnPage() {
  const [{ tryOn, common, portrait }, locale] = await Promise.all([getDictionary(), getLocale()]);
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

        <Card as="section" aria-labelledby="portrait-title" className="col-span-4 flex flex-col gap-4 p-5 md:col-span-8 lg:col-span-12">
          <div className="flex flex-col gap-1">
            <h2 id="portrait-title" className="font-serif text-headline-md">{portrait.sectionTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{portrait.sectionLead}</p>
          </div>
          <Suspense fallback={<p>{common.loading}</p>}>
            <Studio dresses={dresses} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}

async function Studio({ dresses }: { dresses: Awaited<ReturnType<typeof getTryOnDresses>> }) {
  const [user, dict] = await Promise.all([getSessionUser(), getDictionary()]);
  const testMode = process.env.TRY_ON_FAKE_PROVIDER === "1" && !process.env.VERCEL;
  const enabled = testMode || (process.env.TRY_ON_AI_ENABLED === "true" && !!process.env.AI_GATEWAY_API_KEY);
  return <PortraitStudio dresses={dresses} copy={dict.portrait} signedIn={!!user} enabled={enabled} testMode={testMode} />;
}
