import Link from "next/link";
import type { ReactNode } from "react";

/** Editorial header for detail pages: kicker with region link, display title, subtitle, lead and actions. */
export function DetailHeader({
  kicker,
  region,
  title,
  subtitle,
  lead,
  actions,
  children,
}: {
  kicker: string;
  region: { slug: string; name: string } | null;
  title: string;
  subtitle?: string;
  lead?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="rise flex flex-col gap-4 pb-10">
      <p className="flex flex-wrap items-center gap-2 text-label-sm uppercase text-secondary">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
        {kicker}
        {region ? (
          <>
            <span aria-hidden="true">·</span>
            <Link href={`/regions/${region.slug}`} className="underline decoration-1 underline-offset-4 hover:text-on-surface">
              {region.name}
            </Link>
          </>
        ) : null}
      </p>
      {/* Content text is data: plain text nodes only. */}
      <h1 className="max-w-4xl font-serif text-display-mobile text-on-surface md:text-display">{title}</h1>
      {subtitle ? <p className="font-serif text-body-lg font-light italic text-on-surface-variant">{subtitle}</p> : null}
      {lead ? <p className="measure text-body-lg text-on-surface-variant">{lead}</p> : null}
      {children}
      {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
    </header>
  );
}

/** Shown above a staff preview of a draft. */
export function PreviewBanner({ text }: { text: string }) {
  return (
    <p className="mb-8 rounded border-2 border-dashed border-secondary bg-secondary-container p-4 text-body-md text-on-secondary-container">
      {text}
    </p>
  );
}
