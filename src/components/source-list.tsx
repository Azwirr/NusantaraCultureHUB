import { BookMarked, ExternalLink } from "lucide-react";

import type { SourceItem } from "@/lib/content";

/** The sources an approved item cites, with a note on how it was checked. */
export function SourceList({
  sources,
  copy,
}: {
  sources: SourceItem[];
  copy: { sourcesHeading: string; sourcesNote: string; opensNewTab: string };
}) {
  if (!sources.length) return null;
  return (
    <section aria-labelledby="sources-heading" className="rule-lead flex flex-col gap-4">
      <h2 id="sources-heading" className="flex items-center gap-2 font-serif text-headline-md text-on-surface">
        <BookMarked aria-hidden="true" size={22} strokeWidth={1.75} className="text-secondary" />
        {copy.sourcesHeading}
      </h2>
      <p className="measure text-body-md text-on-surface-variant">{copy.sourcesNote}</p>
      <ol className="flex flex-col gap-3">
        {sources.map((source) => (
          <li key={source.id} className="measure flex flex-col gap-1 border-l-2 border-secondary pl-4">
            {/* Source details are reviewer-entered text: plain text only. */}
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1.5 text-body-md text-primary underline"
              >
                <span className="break-words">{source.title}</span>
                <ExternalLink aria-hidden="true" size={16} strokeWidth={1.75} className="mt-1 shrink-0" />
                <span className="sr-only">{copy.opensNewTab}</span>
              </a>
            ) : (
              <p className="text-body-md text-on-surface">{source.title}</p>
            )}
            {source.credit || source.license ? (
              <p className="text-body-sm text-on-surface-variant">
                {[source.credit, source.license].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
