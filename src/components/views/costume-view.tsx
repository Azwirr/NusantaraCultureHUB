import { Shirt } from "lucide-react";
import type { ReactNode } from "react";

import type { CostumeDetail } from "@/lib/content";
import { fill } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { CostumeArt } from "../line-art";
import { SourceList } from "../source-list";
import { DetailHeader } from "./detail-header";

/** Traditional dress info card with its reference image. Try-on arrives in Phase 4. */
export function CostumeView({ costume, dict, actions }: { costume: CostumeDetail; dict: Dictionary; actions?: ReactNode }) {
  const copy = dict.costumeDetail;
  return (
    <article>
      <DetailHeader
        kicker={dict.common.types.costume}
        region={costume.region}
        title={costume.title}
        subtitle={costume.altTitle !== costume.title ? costume.altTitle : undefined}
        actions={actions}
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <figure className="overflow-hidden rounded border border-ink bg-surface-container-lowest p-3 shadow-2">
          {costume.imageUrl ? (
            // Reviewed reference image; plain img keeps remote hosts out of next/image config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={costume.imageUrl}
              alt={fill(copy.imageAlt, { name: costume.title })}
              className="mx-auto h-auto w-full max-w-sm"
            />
          ) : (
            <CostumeArt className="mx-auto h-48 w-full text-secondary" />
          )}
          {costume.picture ? (
            <figcaption className="mt-2 text-center text-body-sm text-on-surface-variant">
              {fill(dict.common.pictureCredit, { credit: costume.picture.credit, licence: costume.picture.licence })}
            </figcaption>
          ) : null}
        </figure>
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="info-heading" className="rule-lead flex flex-col gap-4">
            <h2 id="info-heading" className="font-serif text-headline-lg-mobile text-on-surface">
              {copy.info}
            </h2>
            {/* Content text is data: plain text nodes only. */}
            <p className="measure text-body-lg whitespace-pre-line text-on-surface">{costume.info}</p>
          </section>
          <p className="flex items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-on-surface-variant">
            <Shirt aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
            <span>{copy.tryOnSoon}</span>
          </p>
          <SourceList sources={costume.sources} copy={dict.common} />
        </div>
      </div>
    </article>
  );
}
