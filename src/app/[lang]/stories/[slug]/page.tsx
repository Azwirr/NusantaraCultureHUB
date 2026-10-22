import { AudioLines, Clock } from "lucide-react";
import type { Metadata } from "next";

import { Chip } from "@/components/chip";
import { StoryArt } from "@/components/line-art";
import { PageHeader } from "@/components/page-header";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const { storyDetail } = await getDictionary();
  return { title: storyDetail.title };
}

// Phase 1 placeholder: no audio, TTS or player code yet (FR-04/FR-05 come later).
export default async function StoryPage() {
  const { storyDetail, common } = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={storyDetail.kicker} title={storyDetail.title}>
        <div>
          <Chip tone="neutral" icon={<Clock size={14} strokeWidth={1.75} />}>
            {common.comingSoon}
          </Chip>
        </div>
      </PageHeader>
      <PlaceholderPanel
        art={<StoryArt className="mx-auto h-32 w-full max-w-72" />}
        body={storyDetail.body}
        note={storyDetail.accessibilityNote}
        noteIcon={<AudioLines size={20} strokeWidth={1.75} />}
        backHref="/library"
        backLabel={common.backToLibrary}
      />
    </div>
  );
}
