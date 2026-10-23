import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SaveSlot } from "@/components/save-slot";
import { CostumeView } from "@/components/views/costume-view";
import { getCostume } from "@/lib/content";
import { contentHref } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/costumes/[slug]">): Promise<Metadata> {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const costume = await getCostume(slug, locale);
  return costume ? { title: costume.title } : { title: dict.costumeDetail.title };
}

// Traditional dress info card (approved only). Try-on arrives in Phase 4.
export default async function CostumePage({ params }: PageProps<"/[lang]/costumes/[slug]">) {
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
        <Costume params={params} />
      </Suspense>
    </div>
  );
}

async function Costume({ params }: Pick<PageProps<"/[lang]/costumes/[slug]">, "params">) {
  const [{ slug }, locale, dict] = await Promise.all([params, getLocale(), getDictionary()]);
  const costume = await getCostume(slug, locale);
  if (!costume) notFound();
  return <CostumeView
      costume={costume}
      dict={dict}
      actions={<SaveSlot type="costume" id={costume.id} title={costume.title} nextPath={contentHref("costume", costume.slug)} copy={dict.save} />}
    />;
}
