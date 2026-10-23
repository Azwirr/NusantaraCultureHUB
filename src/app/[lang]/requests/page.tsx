import { LogIn, MessageSquarePlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";
import { getSessionUser } from "@/lib/auth";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getPublicRequests } from "@/lib/requests";

export async function generateMetadata(): Promise<Metadata> {
  const { requests } = await getDictionary();
  return { title: requests.title, description: requests.lead };
}

// FR-17: members ask for new content; everyone sees what was asked.
export default async function RequestsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const { requests, common } = dict;
  return (
    <div className="page-container py-10 md:py-16">
      <PageHeader kicker={requests.kicker} title={requests.title} lead={requests.lead} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card as="section" aria-label={requests.formHeading} className="p-5 md:p-6">
          <Suspense fallback={<SignInPrompt dict={dict} />}>
            <FormSlot dict={dict} />
          </Suspense>
        </Card>
        <section aria-labelledby="requests-list" className="flex min-w-0 flex-col gap-4">
          <h2 id="requests-list" className="rule-lead font-serif text-headline-lg-mobile text-on-surface">
            {requests.listHeading}
          </h2>
          <Suspense
            fallback={
              <p role="status" className="text-body-md text-on-surface-variant">
                {common.loading}
              </p>
            }
          >
            <RequestList dict={dict} locale={locale} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

function SignInPrompt({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="font-serif text-headline-md text-on-surface">{dict.requests.formHeading}</h2>
      <p className="text-body-md text-on-surface-variant">{dict.requests.signInPrompt}</p>
      <Link
        href="/login?next=%2Frequests"
        className="press inline-flex min-h-12 items-center gap-2 rounded border border-primary bg-primary px-5 text-label-md text-on-primary shadow-1 hover:bg-primary-strong"
      >
        <LogIn aria-hidden="true" size={18} strokeWidth={1.75} />
        {dict.requests.signInLink}
      </Link>
    </div>
  );
}

async function FormSlot({ dict }: { dict: Dictionary }) {
  const user = await getSessionUser();
  if (!user) return <SignInPrompt dict={dict} />;
  return <RequestForm copy={dict.requests} />;
}

const TONES = { open: "neutral", planned: "primary", done: "secondary", hidden: "neutral" } as const;

async function RequestList({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const items = await getPublicRequests(50);
  const { requests } = dict;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Jakarta" });
  if (!items.length) {
    return (
      <p className="flex items-start gap-3 rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
        <MessageSquarePlus aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        {requests.empty}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <article className="flex flex-col gap-2 rounded border border-ink bg-surface-container-lowest p-4 shadow-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              {/* Member-entered text: plain text nodes only. */}
              <h3 className="min-w-0 font-serif text-headline-md break-words text-on-surface">{item.title}</h3>
              <Chip tone={TONES[item.status]}>{requests.statuses[item.status]}</Chip>
            </div>
            {item.note ? <p className="text-body-md break-words whitespace-pre-line text-on-surface-variant">{item.note}</p> : null}
            <p className="text-body-sm text-on-surface-variant">
              {item.nickname ? `${fill(requests.by, { nickname: item.nickname })} · ` : ""}
              <time dateTime={item.createdAt}>{date.format(new Date(item.createdAt))}</time>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
