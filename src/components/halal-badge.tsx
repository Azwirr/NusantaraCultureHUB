import { ShieldCheck } from "lucide-react";

import { canShowHalalBadge } from "@/lib/halal";

import { Chip } from "./chip";

/**
 * Renders the halal label only when canShowHalalBadge(status) is true, i.e.
 * halal_status is exactly "verified_by_source". Otherwise renders nothing.
 */
export function HalalBadge({ status, label }: { status: unknown; label: string }) {
  if (!canShowHalalBadge(status)) return null;
  return (
    <Chip tone="primary" icon={<ShieldCheck size={16} strokeWidth={1.75} />}>
      {label}
    </Chip>
  );
}
