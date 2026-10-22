import { ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getDraftCounts, REVIEW_ENTITIES, type ReviewEntityType } from "@/lib/review";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.title, robots: { index: false, follow: false } };
}

export default async function ReviewPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.review.kicker} title={dict.review.title} lead={dict.review.lead} />
      <Suspense
        fallback={
          <Card className="max-w-xl p-6">
            <p role="status" className="text-body-md text-on-surface-variant">
              {dict.review.loading}
            </p>
          </Card>
        }
      >
        <DraftSummary dict={dict} locale={locale} />
      </Suspense>
    </div>
  );
}

/**
 * Staff only: requireStaff() runs after the static shell has streamed, so
 * signed-in non-staff get the not-found UI with HTTP 200 (guests never get
 * here: the proxy redirects them). RLS still decides what the counts see.
 */
async function DraftSummary({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  await requireStaff();
  const counts = await getDraftCounts();
  const format = new Intl.NumberFormat(locale);
  const types = Object.keys(REVIEW_ENTITIES) as ReviewEntityType[];

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="px-5 pt-5 pb-3 text-left font-serif text-headline-md text-on-surface">
            {dict.review.tableCaption}
          </caption>
          <thead>
            <tr className="border-y border-ink bg-surface-container-low">
              <th scope="col" className="px-5 py-3 text-label-sm uppercase text-on-surface-variant">
                {dict.review.typeHeader}
              </th>
              <th scope="col" className="px-5 py-3 text-right text-label-sm uppercase text-on-surface-variant">
                {dict.review.draftsHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type} className="border-b border-ink last:border-b-0">
                <th scope="row" className="px-5 py-3 text-body-md font-normal text-on-surface">
                  {dict.review.types[type]}
                </th>
                <td className="px-5 py-3 text-right text-body-md tabular-nums text-on-surface">
                  {format.format(counts[type])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="flex items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-on-surface-variant">
        <ClipboardList aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
        <span>{dict.review.phaseNote}</span>
      </p>
    </div>
  );
}
