import type { ReactNode } from "react";

import type { CeremonyDetail } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { SourceList } from "../source-list";
import { CoverArt } from "../cover-art";
import { DetailHeader } from "./detail-header";

/** A customary ceremony: what it is, when it is held, and how it is carried out. */
export function CeremonyView({ ceremony, dict, actions }: { ceremony: CeremonyDetail; dict: Dictionary; actions?: ReactNode }) {
  const copy = dict.ceremonyDetail;
  return (
    <article>
      <DetailHeader
        kicker={dict.common.types.ceremony}
        region={ceremony.region}
        title={ceremony.title}
        subtitle={ceremony.altTitle !== ceremony.title ? ceremony.altTitle : undefined}
        actions={actions}
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {ceremony.picture ? <CoverArt cover={ceremony.picture} portrait /> : null}
        <div className="flex min-w-0 flex-col gap-10">
          {/* Content text is data: plain text nodes only. */}
          <section aria-labelledby="summary-heading" className="rule-lead flex flex-col gap-4">
            <h2 id="summary-heading" className="font-serif text-headline-lg-mobile text-on-surface">
              {copy.summary}
            </h2>
            <p className="measure text-body-lg text-on-surface">{ceremony.summary}</p>
          </section>
          {ceremony.timing ? (
            <section aria-labelledby="timing-heading" className="flex flex-col gap-2">
              <h2 id="timing-heading" className="font-serif text-headline-md text-on-surface">
                {copy.timing}
              </h2>
              <p className="measure text-body-lg text-on-surface">{ceremony.timing}</p>
            </section>
          ) : null}
          <section aria-labelledby="body-heading" className="flex flex-col gap-4">
            <h2 id="body-heading" className="font-serif text-headline-md text-on-surface">
              {copy.body}
            </h2>
            <p className="measure text-body-lg whitespace-pre-line text-on-surface">{ceremony.body}</p>
          </section>
          <SourceList sources={ceremony.sources} copy={dict.common} />
        </div>
      </div>
    </article>
  );
}
