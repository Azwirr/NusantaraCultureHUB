import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { ReviewNav } from "@/components/review/review-nav";
import { requireStaff } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { type AuditEntry, getAuditLog, reviewTypeForTable } from "@/lib/review";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.audit.title, robots: { index: false, follow: false } };
}

export default async function AuditPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.review.kicker} title={dict.review.audit.title} lead={dict.review.audit.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.review.loading}
          </p>
        }
      >
        <AuditTable dict={dict} locale={locale} />
      </Suspense>
    </div>
  );
}

function itemCell(entry: AuditEntry, dict: Dictionary) {
  const { review, roles } = dict;
  if (entry.entity === "user_roles") {
    const role = entry.details.role === "owner" || entry.details.role === "reviewer" ? roles[entry.details.role] : "";
    const nickname = typeof entry.details.nickname === "string" ? entry.details.nickname : review.detail.unknownPerson;
    return review.audit.roleTarget.replace("{role}", role).replace("{nickname}", nickname);
  }
  const type = reviewTypeForTable(entry.entity);
  if (!type) return entry.entity;
  return (
    <Link href={`/review/${type}/${entry.entityId}`} className="text-primary underline">
      {review.types[type]}
      <span className="sr-only"> {entry.entityId}</span>
    </Link>
  );
}

/** Staff only (RLS: audit_log is readable by reviewers and owners). */
async function AuditTable({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const user = await requireStaff("/review/audit");
  const entries = await getAuditLog(100);
  const { review } = dict;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

  return (
    <>
      <ReviewNav copy={review.nav} current="audit" isOwner={user.roles.includes("owner")} />
      {entries.length ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="px-5 pt-5 pb-3 text-left font-serif text-headline-md text-on-surface">
              {review.audit.caption}
            </caption>
            <thead>
              <tr className="border-y border-ink bg-surface-container-low">
                {[review.audit.when, review.audit.who, review.audit.what, review.audit.item, review.audit.reason].map((label) => (
                  <th key={label} scope="col" className="px-4 py-3 text-label-sm uppercase text-on-surface-variant">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-ink align-top last:border-b-0">
                  <td className="px-4 py-3 text-body-sm whitespace-nowrap text-on-surface">
                    <time dateTime={entry.createdAt}>{date.format(new Date(entry.createdAt))}</time>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface">
                    {entry.actor ?? (entry.actorType === "user" ? review.detail.unknownPerson : review.detail.system)}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface">
                    {review.auditActions[entry.action as keyof typeof review.auditActions] ?? entry.action}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface">{itemCell(entry, dict)}</td>
                  {/* Reasons are user-entered text: plain text only. */}
                  <td className="max-w-xs px-4 py-3 text-body-sm break-words text-on-surface">{entry.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <p className="rounded border border-dashed border-outline bg-surface-container-low p-6 text-body-md text-on-surface-variant">
          {review.audit.empty}
        </p>
      )}
    </>
  );
}
