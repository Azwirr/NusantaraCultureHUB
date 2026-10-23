import type { ReviewStatus } from "@/lib/review-types";

const tones: Record<ReviewStatus, string> = {
  draft: "bg-status-draft-bg text-status-draft-fg",
  approved: "bg-status-approved-bg text-status-approved-fg",
  rejected: "bg-status-rejected-bg text-status-rejected-fg",
  unpublished: "bg-status-unpublished-bg text-status-unpublished-fg",
};

/** Review status chip for staff screens. The label carries the meaning, not the colour. */
export function StatusBadge({ status, label }: { status: ReviewStatus; label: string }) {
  return (
    <span
      className={`inline-flex min-h-7 shrink-0 items-center rounded-sm border border-ink px-2 text-label-sm ${tones[status]}`}
    >
      {label}
    </span>
  );
}
