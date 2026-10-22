import { Clock } from "lucide-react";
import type { Metadata } from "next";

import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { regionDetail } = await getDictionary();
  return { title: regionDetail.title };
}

// Phase 1 placeholder. The slug is not read yet; Phase 2 loads the approved
// region inside <Suspense> and calls notFound() for anything else.
export default async function RegionPage() {
  const { regionDetail, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={regionDetail.kicker} title={regionDetail.title}>
        <div>
          <Chip tone="neutral" icon={<Clock size={14} strokeWidth={1.75} />}>
            {common.comingSoon}
          </Chip>
        </div>
      </PageHeader>
      <PlaceholderPanel body={regionDetail.body} backHref="/regions" backLabel={common.backToRegions} />
    </div>
  );
}
