import { ArrowLeft, ArrowRight, Eye, ExternalLink, Info, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { z } from "zod";

import { Card } from "@/components/card";
import { ActionForm } from "@/components/review/action-form";
import { DecisionForm } from "@/components/review/decision-form";
import { FieldsForm } from "@/components/review/fields-form";
import type { ReviewMessageCopy } from "@/components/review/review-message";
import { ReviewNav } from "@/components/review/review-nav";
import { StatusBadge } from "@/components/review/status-badge";
import { requireStaff } from "@/lib/auth";
import { candidateSourcesFor } from "@/lib/candidate-sources";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { addSource, linkSource, unlinkSource } from "@/lib/review-actions";
import { availableActions, getReviewItem, getSourceOptions, isReviewEntityType } from "@/lib/review";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.title, robots: { index: false, follow: false } };
}

export default async function ReviewItemPage({ params }: PageProps<"/[lang]/review/[type]/[id]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.review.loading}
          </p>
        }
      >
        <ReviewItem dict={dict} locale={locale} params={params} />
      </Suspense>
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: ReactNode; id: string }) {
  return (
    <Card as="section" aria-labelledby={id} className="flex flex-col gap-4 p-5 md:p-6">
      <h2 id={id} className="font-serif text-headline-md text-on-surface">
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Note({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-on-surface">
      <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-primary">
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}

async function ReviewItem({
  dict,
  locale,
  params,
}: {
  dict: Dictionary;
  locale: Locale;
  params: PageProps<"/[lang]/review/[type]/[id]">["params"];
}) {
  const { type, id } = await params;
  if (!isReviewEntityType(type) || !z.guid().safeParse(id).success) notFound();
  const user = await requireStaff(`/review/${type}/${id}`);
  const [item, sourceOptions] = await Promise.all([getReviewItem(type, id, user.id), getSourceOptions()]);
  if (!item) notFound();

  const { review, language, vocab } = dict;
  const detail = review.detail;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
  const messages: ReviewMessageCopy = {
    errors: review.errors,
    fields: detail.fields,
    idCode: language.idCode,
    enCode: language.enCode,
  };
  const locked = item.status === "approved";
  const actions = availableActions(item.status);
  const linkedIds = new Set(item.sources.map((source) => source.sourceId));
  const linkable = sourceOptions.filter((option) => !linkedIds.has(option.id));
  const linkedUrls = new Set(item.sources.map((source) => source.url));
  const suggestions = candidateSourcesFor(type, item.row.slug).filter((s) => !linkedUrls.has(s.url));
  const person = (name: string | null, hasId: boolean) => (name ?? (hasId ? detail.unknownPerson : detail.system));
  const target = { type, id };

  return (
    <>
      <ReviewNav copy={review.nav} current={null} isOwner={user.roles.includes("owner")} />
      <Link
        href={item.parent ? `/review/${item.parent.type}/${item.parent.id}` : `/review?type=${type}`}
        className="mb-6 inline-flex min-h-12 items-center gap-2 rounded text-label-md text-primary hover:underline"
      >
        <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        {item.parent ? `${detail.parent}: ${item.parent.title}` : detail.back}
      </Link>

      <div className="flex flex-col gap-3 pb-8">
        <p className="flex items-center gap-2 text-label-sm uppercase text-secondary">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-secondary" />
          {review.types[type]}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {/* Content text is data: plain text nodes only. */}
          <h1 className="break-words font-serif text-headline-lg-mobile text-on-surface md:text-headline-lg">
            {type === "chapter" ? `${item.parent?.title ?? ""} · ${review.chapter} ${item.row.chapter_no}` : item.title}
          </h1>
          <StatusBadge status={item.status} label={review.statuses[item.status]} />
          {type === "story" || type === "recipe" || type === "costume" || type === "ceremony" ? (
            <Link
              href={`/review/preview/${type}/${id}`}
              className="inline-flex min-h-12 items-center gap-2 rounded px-3 text-label-md text-primary hover:bg-surface-container"
            >
              <Eye aria-hidden="true" size={18} strokeWidth={1.75} />
              {dict.common.previewLink}
            </Link>
          ) : null}
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-body-sm text-on-surface-variant">
          <div className="flex gap-1">
            <dt>{detail.createdBy}:</dt>
            <dd className="text-on-surface">{person(item.createdBy, !!item.row.created_by)}</dd>
          </div>
          <div className="flex gap-1">
            <dt>{detail.updatedBy}:</dt>
            <dd className="text-on-surface">{person(item.updatedBy, !!item.row.updated_by)}</dd>
          </div>
        </dl>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section id="fields-heading" title={detail.fieldsHeading}>
            {locked ? <Note icon={<Lock size={20} strokeWidth={1.75} />}>{detail.lockedNote}</Note> : null}
            <FieldsForm
              type={type}
              id={id}
              values={item.row}
              ingredients={item.children.flatMap((child) => (child.kind === "ingredient" ? [child] : []))}
              steps={item.children.flatMap((child) => (child.kind === "step" ? [child] : []))}
              locked={locked}
              copy={{
                ...detail,
                idCode: language.idCode,
                enCode: language.enCode,
                dietary: vocab.dietary,
                units: vocab.units,
              }}
              messages={messages}
            />
          </Section>

          {type === "story" ? (
            <Section id="chapters-heading" title={detail.chaptersHeading}>
              <ol className="flex flex-col gap-2">
                {item.children.flatMap((child) =>
                  child.kind === "chapter"
                    ? [
                        <li key={child.id}>
                          <Link
                            href={`/review/chapter/${child.id}`}
                            className="flex min-h-12 flex-wrap items-center gap-3 rounded border border-ink px-4 py-2 hover:bg-surface-container"
                          >
                            <span className="flex-1 text-body-md text-on-surface">
                              {review.chapter} {child.chapterNo}
                            </span>
                            <StatusBadge status={child.status} label={review.statuses[child.status]} />
                            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} className="text-primary" />
                          </Link>
                        </li>,
                      ]
                    : [],
                )}
              </ol>
            </Section>
          ) : null}

          <Section id="sources-heading" title={detail.sourcesHeading}>
            <p className="text-body-md text-on-surface-variant">{detail.sourcesNote}</p>
            {item.sources.length ? (
              <ul className="flex flex-col gap-3">
                {item.sources.map((source) => (
                  <li key={source.linkId} className="flex flex-col gap-2 rounded border border-ink p-4">
                    <p className="break-words text-body-md text-on-surface">{source.title}</p>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 break-all text-body-sm text-primary underline"
                      >
                        {source.url}
                        <ExternalLink aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0" />
                        <span className="sr-only">{detail.opensNewTab}</span>
                      </a>
                    ) : null}
                    {source.credit || source.license ? (
                      <p className="text-body-sm text-on-surface-variant">
                        {[source.credit, source.license].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                    {!locked ? (
                      <ActionForm
                        action={unlinkSource}
                        hidden={{ link_id: source.linkId }}
                        submitLabel={detail.unlink}
                        pendingLabel={review.detail.pending}
                        success={detail.sourceRemoved}
                        copy={messages}
                        variant="ghost"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-md text-on-surface">{detail.noSources}</p>
            )}

            {!locked && suggestions.length ? (
              <section aria-labelledby="suggestions-heading" className="flex flex-col gap-3 rounded border border-dashed border-outline p-4">
                <h3 id="suggestions-heading" className="text-label-md text-on-surface">
                  {detail.suggestionsHeading}
                </h3>
                <Note icon={<Info size={20} strokeWidth={1.75} />}>{detail.suggestionsNote}</Note>
                <ul className="flex flex-col gap-4">
                  {suggestions.map((suggestion) => (
                    <li key={suggestion.url} className="flex flex-col gap-2">
                      <p className="text-body-md text-on-surface">{suggestion.title}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {suggestion.credit} · {suggestion.covers[locale]}
                      </p>
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 break-all text-body-sm text-primary underline"
                      >
                        {suggestion.url}
                        <ExternalLink aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0" />
                        <span className="sr-only">{detail.opensNewTab}</span>
                      </a>
                      <ActionForm
                        action={addSource}
                        hidden={{ ...target, title: suggestion.title, url: suggestion.url, credit: suggestion.credit }}
                        submitLabel={detail.useSuggestion}
                        pendingLabel={detail.pending}
                        success={detail.sourceAdded}
                        copy={messages}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {!locked ? (
              <div className="grid gap-6 md:grid-cols-2">
                <ActionForm
                  action={addSource}
                  hidden={target}
                  submitLabel={detail.addSource}
                  pendingLabel={detail.pending}
                  success={detail.sourceAdded}
                  copy={messages}
                >
                  <h3 className="text-label-md text-on-surface">{detail.addSourceHeading}</h3>
                  <SourceInput name="title" label={detail.sourceTitle} required maxLength={300} />
                  <SourceInput name="url" label={detail.sourceUrl} maxLength={2048} type="url" />
                  <SourceInput name="credit" label={detail.sourceCredit} maxLength={300} />
                  <SourceInput name="license" label={detail.sourceLicense} maxLength={200} />
                </ActionForm>
                {linkable.length ? (
                  <ActionForm
                    action={linkSource}
                    hidden={target}
                    submitLabel={detail.linkSource}
                    pendingLabel={detail.pending}
                    success={detail.sourceAdded}
                    copy={messages}
                  >
                    <h3 className="text-label-md text-on-surface">{detail.linkSourceHeading}</h3>
                    <label htmlFor="link-source" className="text-label-md text-on-surface">
                      {detail.chooseSource}
                    </label>
                    <select
                      id="link-source"
                      name="source_id"
                      required
                      className="min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-3 text-body-md text-on-surface"
                    >
                      {linkable.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </ActionForm>
                ) : null}
              </div>
            ) : null}
          </Section>
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6">
          <Section id="decision-heading" title={detail.actionsHeading}>
            {item.createdByMe ? <Note icon={<Info size={20} strokeWidth={1.75} />}>{detail.youCreated}</Note> : null}
            {!item.createdByMe && item.editedByMe ? (
              <Note icon={<Info size={20} strokeWidth={1.75} />}>{detail.youEdited}</Note>
            ) : null}
            {actions.length ? (
              <DecisionForm
                type={type}
                id={id}
                actions={actions}
                copy={{
                  reason: detail.reason,
                  reasonHint: detail.reasonHint,
                  pending: detail.pending,
                  actions: review.actions,
                  done: detail.done,
                }}
                messages={messages}
              />
            ) : (
              <p className="text-body-md text-on-surface-variant">{detail.noActions}</p>
            )}
          </Section>

          <Section id="history-heading" title={detail.historyHeading}>
            {item.history.length ? (
              <ol className="flex flex-col gap-3">
                {item.history.map((entry) => (
                  <li key={entry.id} className="flex flex-col gap-0.5 border-l-2 border-outline-variant pl-3">
                    <p className="text-body-md text-on-surface">
                      {review.auditActions[entry.action as keyof typeof review.auditActions] ?? entry.action}
                      {" · "}
                      {entry.actor ?? (entry.actorType === "user" ? detail.unknownPerson : detail.system)}
                    </p>
                    <time dateTime={entry.createdAt} className="text-body-sm text-on-surface-variant">
                      {date.format(new Date(entry.createdAt))}
                    </time>
                    {entry.reason ? <p className="break-words text-body-sm text-on-surface">{entry.reason}</p> : null}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-body-md text-on-surface-variant">{detail.noHistory}</p>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function SourceInput({
  name,
  label,
  required,
  maxLength,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  maxLength: number;
  type?: "text" | "url";
}) {
  const inputId = `source-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label-md text-on-surface">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className="min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface"
      />
    </div>
  );
}
