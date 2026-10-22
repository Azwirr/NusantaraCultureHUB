import { LayoutList } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { regions } = await getDictionary();
  return { title: regions.title, description: regions.lead };
}

// FR-03: a list of approved regions, never a map. Empty until review in Phase 2.
export default async function RegionsPage() {
  const { regions, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={regions.kicker} title={regions.title} lead={regions.lead} />
      <EmptyState
        icon={<LayoutList size={28} strokeWidth={1.75} />}
        title={regions.emptyTitle}
        description={regions.emptyBody}
        action={
          <ButtonLink href="/library" variant="secondary">
            {common.openLibrary}
          </ButtonLink>
        }
      />
    </div>
  );
}
