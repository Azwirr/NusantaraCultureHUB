import type { Metadata } from "next";
import { Suspense } from "react";

import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { RequestStatusForm } from "@/components/review/request-status-form";
import { ReviewNav } from "@/components/review/review-nav";
import { requireStaff } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getAllRequests } from "@/lib/requests";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.requestsQueue.title, robots: { index: false, follow: false } };
}

export default async function ReviewRequestsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.review.kicker} title={dict.review.requestsQueue.title} lead={dict.review.requestsQueue.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.review.loading}
          </p>
        }
      >
        <Queue dict={dict} locale={locale} />
      </Suspense>
    </div>
  );
}

/** Staff only; RLS shows staff every request and lets only staff change the status. */
async function Queue({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const user = await requireStaff("/review/requests");
  const items = await getAllRequests();
  const { review, requests } = dict;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
  return (
    <>
      <ReviewNav copy={review.nav} current="requests" isOwner={user.roles.includes("owner")} />
      {items.length ? (
        <ul className="flex max-w-3xl flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded border border-ink bg-surface-container-lowest p-4 shadow-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                {/* Member-entered text: plain text nodes only. */}
                <p className="min-w-0 font-serif text-headline-md break-words text-on-surface">{item.title}</p>
                <Chip tone={item.status === "planned" ? "primary" : "neutral"}>{requests.statuses[item.status]}</Chip>
              </div>
              {item.note ? <p className="text-body-md break-words whitespace-pre-line text-on-surface-variant">{item.note}</p> : null}
              <p className="text-body-sm text-on-surface-variant">
                <time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time>
              </p>
              <RequestStatusForm
                id={item.id}
                current={item.status}
                copy={{ label: review.requestsQueue.setStatus, saved: review.requestsQueue.saved, statuses: requests.statuses, errors: requests.errors }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded border border-dashed border-outline bg-surface-container-low p-6 text-body-md text-on-surface-variant">
          {review.requestsQueue.empty}
        </p>
      )}
    </>
  );
}
