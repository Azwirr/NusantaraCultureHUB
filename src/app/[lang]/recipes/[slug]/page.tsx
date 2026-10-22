import { Clock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { Chip } from "@/components/chip";
import { RecipeArt } from "@/components/line-art";
import { PageHeader } from "@/components/page-header";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { recipeDetail } = await getDictionary();
  return { title: recipeDetail.title };
}

// Phase 1 placeholder. When recipes load, the label goes through
// <HalalBadge status={recipe.halal_status} />, which shows only verified_by_source.
export default async function RecipePage() {
  const { recipeDetail, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={recipeDetail.kicker} title={recipeDetail.title}>
        <div>
          <Chip tone="neutral" icon={<Clock size={14} strokeWidth={1.75} />}>
            {common.comingSoon}
          </Chip>
        </div>
      </PageHeader>
      <PlaceholderPanel
        art={<RecipeArt className="mx-auto h-32 w-full max-w-72" />}
        body={recipeDetail.body}
        note={recipeDetail.halalNote}
        noteIcon={<ShieldCheck size={20} strokeWidth={1.75} />}
        backHref="/library"
        backLabel={common.backToLibrary}
      />
    </div>
  );
}
