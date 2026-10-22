import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { ButtonLink } from "./button";
import { Card } from "./card";

/** Body of a Phase 1 placeholder page: what will appear here, plus a way back. */
export function PlaceholderPanel({
  body,
  note,
  noteIcon,
  backHref,
  backLabel,
  art,
}: {
  body: string;
  note?: string;
  noteIcon?: ReactNode;
  backHref: string;
  backLabel: string;
  art?: ReactNode;
}) {
  return (
    <Card className="flex max-w-3xl flex-col gap-5 p-5 md:p-6">
      {art ? (
        <div className="rounded border border-ink bg-surface-container-low px-4 py-3 text-secondary">{art}</div>
      ) : null}
      <p className="text-body-lg text-on-surface">{body}</p>
      {note ? (
        <p className="flex items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-on-surface-variant">
          {noteIcon ? (
            <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-primary">
              {noteIcon}
            </span>
          ) : null}
          <span>{note}</span>
        </p>
      ) : null}
      <div>
        <ButtonLink href={backHref} variant="secondary">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
          {backLabel}
        </ButtonLink>
      </div>
    </Card>
  );
}
