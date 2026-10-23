import type { ReactNode } from "react";

/** Editorial section opener: a ruled kicker, the h2 and an optional lead. */
export function SectionHeading({
  id,
  kicker,
  title,
  lead,
  action,
}: {
  id: string;
  kicker?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rule-lead mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-2">
        {kicker ? <p className="text-label-sm uppercase text-secondary">{kicker}</p> : null}
        <h2 id={id} className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {title}
        </h2>
        {lead ? <p className="text-body-lg text-on-surface-variant">{lead}</p> : null}
      </div>
      {action}
    </div>
  );
}
