import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { library } = await getDictionary();
  return { title: library.title, description: library.lead };
}

// Phase 1: no content queries and no searchParams yet. Approved stories,
// recipes and costumes (FR-02) arrive with the content phase.
export default async function LibraryPage() {
  const { library, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={library.kicker} title={library.title} lead={library.lead} />
      <EmptyState
        icon={<BookOpen size={28} strokeWidth={1.75} />}
        title={library.emptyTitle}
        description={library.emptyBody}
        action={
          <ButtonLink href="/" variant="secondary">
            {common.backHome}
          </ButtonLink>
        }
      />
    </div>
  );
}
