import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { ReviewNav } from "@/components/review/review-nav";
import { StatusBadge } from "@/components/review/status-badge";
import { requireStaff } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import {
  countByStatus,
  getQueue,
  isReviewEntityType,
  isReviewStatus,
  REVIEW_ENTITIES,
  REVIEW_STATUSES,
  type ReviewEntityType,
  type ReviewStatus,
} from "@/lib/review";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.title, robots: { index: false, follow: false } };
}

export default async function ReviewPage({ searchParams }: PageProps<"/[lang]/review">) {
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
        <Queue dict={dict} locale={locale} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function filterHref(type: ReviewEntityType | null, status: ReviewStatus | null): string {
  const query = new URLSearchParams();
  if (type) query.set("type", type);
  if (status) query.set("status", status);
  const text = query.toString();
  return text ? `/review?${text}` : "/review";
}

function FilterLinks<T extends string>({
  label,
  options,
  current,
  labels,
  allLabel,
  href,
}: {
  label: string;
  options: readonly T[];
  current: T | null;
  labels: Record<T, string>;
  allLabel: string;
  href: (value: T | null) => string;
}) {
  const items: Array<T | null> = [null, ...options];
  return (
    <div className="flex flex-col gap-2">
      <p id={`filter-${label}`} className="text-label-sm uppercase text-on-surface-variant">
        {label}
      </p>
      <ul aria-labelledby={`filter-${label}`} className="flex flex-wrap gap-2">
        {items.map((value) => {
          const active = value === current;
          return (
            <li key={value ?? "all"}>
              <Link
                href={href(value)}
                aria-current={active ? "true" : undefined}
                className={[
                  "inline-flex min-h-12 items-center rounded-sm border px-3 text-label-md",
                  active
                    ? "border-primary bg-primary text-on-primary"
                    : "border-ink bg-surface-container-lowest text-on-surface hover:bg-surface-container",
                ].join(" ")}
              >
                {value ? labels[value] : allLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Staff only. requireStaff() runs after the static shell has streamed, so
 * signed-in non-staff get the not-found UI (guests never get here: the
 * proxy redirects them). RLS decides what the queries see.
 */
async function Queue({
  dict,
  locale,
  searchParams,
}: {
  dict: Dictionary;
  locale: Locale;
  searchParams: PageProps<"/[lang]/review">["searchParams"];
}) {
  const user = await requireStaff();
  const [query, items] = await Promise.all([searchParams, getQueue()]);
  const type = isReviewEntityType(query.type) ? query.type : null;
  const status = isReviewStatus(query.status) ? query.status : null;
  const counts = countByStatus(items);
  const visible = items.filter((item) => (!type || item.type === type) && (!status || item.status === status));
  const number = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
  const types = Object.keys(REVIEW_ENTITIES) as ReviewEntityType[];
  const { review } = dict;

  return (
    <>
      <ReviewNav copy={review.nav} current="queue" isOwner={user.roles.includes("owner")} />

      <Card className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left">
          <caption className="px-5 pt-5 pb-3 text-left font-serif text-headline-md text-on-surface">
            {review.tableCaption}
          </caption>
          <thead>
            <tr className="border-y border-ink bg-surface-container-low">
              <th scope="col" className="px-5 py-3 text-label-sm uppercase text-on-surface-variant">
                {review.typeHeader}
              </th>
              {REVIEW_STATUSES.map((value) => (
                <th key={value} scope="col" className="px-5 py-3 text-right text-label-sm uppercase text-on-surface-variant">
                  {review.statuses[value]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map((value) => (
              <tr key={value} className="border-b border-ink last:border-b-0">
                <th scope="row" className="px-5 py-3 text-body-md font-normal text-on-surface">
                  {review.types[value]}
                </th>
                {REVIEW_STATUSES.map((s) => (
                  <td key={s} className="px-5 py-3 text-right text-body-md tabular-nums text-on-surface">
                    {number.format(counts[value][s])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mb-6 flex flex-col gap-4">
        <FilterLinks
          label={review.filters.type}
          options={types}
          current={type}
          labels={review.types}
          allLabel={review.filters.all}
          href={(value) => filterHref(value, status)}
        />
        <FilterLinks
          label={review.filters.status}
          options={REVIEW_STATUSES}
          current={status}
          labels={review.statuses}
          allLabel={review.filters.all}
          href={(value) => filterHref(type, value)}
        />
      </div>

      <h2 className="sr-only">{review.listCaption}</h2>
      {visible.length ? (
        <ul className="flex flex-col gap-3">
          {visible.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-label-sm uppercase text-secondary">
                    {review.types[item.type]}
                    {item.context && item.type !== "chapter" ? ` · ${item.context}` : ""}
                  </p>
                  {/* Content text is data: plain text nodes only. */}
                  <p className="break-words font-serif text-headline-md text-on-surface">
                    {item.title}
                    {item.chapterNo ? ` · ${review.chapter} ${item.chapterNo}` : ""}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {review.updated}: <time dateTime={item.updatedAt}>{date.format(new Date(item.updatedAt))}</time>
                  </p>
                </div>
                <StatusBadge status={item.status} label={review.statuses[item.status]} />
                <Link
                  href={`/review/${item.type}/${item.id}`}
                  // Starts with the visible text (WCAG 2.5.3), then names the item.
                  aria-label={`${review.open}: ${item.title}${item.chapterNo ? ` ${review.chapter} ${item.chapterNo}` : ""}`}
                  className="press inline-flex min-h-12 items-center gap-2 rounded border-[1.5px] border-secondary px-4 text-label-md text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
                >
                  {review.open}
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded border border-dashed border-outline bg-surface-container-low p-6 text-body-md text-on-surface-variant">
          {review.empty}
        </p>
      )}
    </>
  );
}
