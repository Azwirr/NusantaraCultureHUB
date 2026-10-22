import type { ReactNode } from "react";

/** Page title block: optional kicker, the page's only h1, and a lead paragraph. */
export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 pb-8">
      {kicker ? (
        <p className="flex items-center gap-2 text-label-sm uppercase text-secondary">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
          {kicker}
        </p>
      ) : null}
      <h1 className="font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">{title}</h1>
      {lead ? <p className="max-w-prose text-body-lg text-on-surface-variant">{lead}</p> : null}
      {children}
    </div>
  );
}
