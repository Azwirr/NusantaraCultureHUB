import { SearchX } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { notFound } = await getDictionary();
  return { title: notFound.title };
}

export default async function NotFound() {
  const { notFound, common } = await getDictionary();
  return (
    <div className="page-container py-10 md:py-16">
      <EmptyState
        headingLevel={1}
        icon={<SearchX size={28} strokeWidth={1.75} />}
        title={notFound.title}
        description={notFound.body}
        action={
          <>
            <ButtonLink href="/">{common.backHome}</ButtonLink>
            <ButtonLink href="/library" variant="secondary">
              {common.openLibrary}
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
