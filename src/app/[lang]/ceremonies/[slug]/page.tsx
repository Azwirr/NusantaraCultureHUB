import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CeremonyView } from "@/components/views/ceremony-view";
import { getCeremony } from "@/lib/content";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/ceremonies/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const ceremony = await getCeremony(slug, locale);
  return ceremony ? { title: ceremony.title, description: ceremony.summary } : { title: dict.ceremonyDetail.title };
}

// A customary ceremony (adat), approved only. Ceremonies cannot be saved yet.
export default async function CeremonyPage({ params }: PageProps<"/[lang]/ceremonies/[slug]">) {
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
        <Ceremony params={params} />
      </Suspense>
    </div>
  );
}

async function Ceremony({ params }: Pick<PageProps<"/[lang]/ceremonies/[slug]">, "params">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const ceremony = await getCeremony(slug, locale);
  if (!ceremony) notFound();
  return <CeremonyView ceremony={ceremony} dict={dict} />;
}
