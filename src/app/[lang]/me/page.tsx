import { ArrowRight, Bookmark, ClipboardList, LogOut, MessageSquarePlus, Settings, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { NicknameForm } from "@/components/auth/nickname-form";
import { Button, ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { SavedList } from "@/components/saved-list";
import { isStaff, requireUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { countSaved, getSavedItems } from "@/lib/bookmarks";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary, getLocale } from "@/lib/i18n/dictionaries";
import { getInitials } from "@/lib/initials";

export async function generateMetadata(): Promise<Metadata> {
  const { me } = await getDictionary();
  return { title: me.title, robots: { index: false, follow: false } };
}

export default async function MePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.me.kicker} title={dict.me.title} />
      <Suspense fallback={<MemberSkeleton label={dict.me.loading} />}>
        <MemberPanel dict={dict} locale={locale} />
      </Suspense>
    </div>
  );
}

function MemberSkeleton({ label }: { label: string }) {
  return (
    <Card className="flex max-w-xl items-center gap-4 p-6">
      <span aria-hidden="true" className="size-16 shrink-0 rounded-full border border-ink bg-surface-container" />
      <p role="status" className="text-body-md text-on-surface-variant">
        {label}
      </p>
    </Card>
  );
}

const PREVIEW_COUNT = 5;

/** Reads the session, so it renders inside <Suspense>. Guests go to /login. */
async function MemberPanel({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const user = await requireUser("/me");
  const saved = await getSavedItems(locale);
  const counts = countSaved(saved);
  const number = new Intl.NumberFormat(locale);
  const initials = getInitials(user.username);
  const roleLabels = user.roles.length > 0 ? user.roles.map((role) => dict.roles[role]) : [dict.me.memberRole];
  const { me } = dict;
  const stats = [
    { key: "total", value: saved.length },
    { key: "story", value: counts.story },
    { key: "recipe", value: counts.recipe },
    { key: "costume", value: counts.costume },
  ] as const;

  // Members who signed in with Google (or whose nickname was taken) must
  // choose one first; changing it later lives in /me/settings.
  const nicknameStep = (
    <NicknameForm
      copy={{
        ...me.nickname,
        label: dict.auth.fields.username,
        hint: dict.auth.fields.usernameHint,
        errors: dict.auth.errors,
      }}
      current={user.username ?? ""}
      required={user.needsNickname}
    />
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        {user.needsNickname ? nicknameStep : null}

        <Card className="flex flex-col gap-5 p-5 md:p-6">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-full border border-ink bg-primary-container font-serif text-headline-md text-on-primary-container"
            >
              {initials ?? <UserRound size={28} strokeWidth={1.75} />}
            </span>
            <dl className="flex min-w-0 flex-col gap-1">
              <dt className="text-label-sm uppercase text-on-surface-variant">{me.usernameLabel}</dt>
              {/* User-entered nickname: a plain text node, never HTML. */}
              <dd className="break-words font-serif text-headline-md text-on-surface">{user.username ?? me.noUsername}</dd>
              <dt className="sr-only">{me.rolesLabel}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {roleLabels.map((label) => (
                    <li key={label}>
                      <Chip tone={user.roles.length > 0 ? "primary" : "neutral"}>{label}</Chip>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
          </div>

          <section aria-label={me.statsLabel}>
            <dl className="grid grid-cols-2 gap-3 rounded border border-ink bg-surface-container-low p-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col items-center gap-0.5 text-center">
                  <dd className="order-first font-serif text-headline-lg-mobile text-primary tabular-nums">{number.format(stat.value)}</dd>
                  <dt className="text-label-sm text-on-surface-variant">{me.stats[stat.key]}</dt>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex flex-col gap-3">
            {isStaff(user) ? (
              <ButtonLink href="/review" className="w-full">
                <ClipboardList aria-hidden="true" size={18} strokeWidth={1.75} />
                {me.reviewLink}
              </ButtonLink>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/me/settings" variant="secondary" className="w-full">
                <Settings aria-hidden="true" size={18} strokeWidth={1.75} />
                {dict.settings.open}
              </ButtonLink>
              <form action={signOut}>
                <Button type="submit" variant="secondary" className="w-full">
                  <LogOut aria-hidden="true" size={18} strokeWidth={1.75} />
                  {me.signOut}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <Link
          href="/requests"
          className="flex min-h-12 items-center gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-primary hover:bg-surface-container"
        >
          <MessageSquarePlus aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0" />
          <span className="flex-1">{dict.requests.cta}</span>
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </Link>
      </div>

      <section aria-labelledby="collection-heading" className="flex min-w-0 flex-col gap-4">
        <div className="rule-lead flex flex-wrap items-end justify-between gap-3">
          <h2 id="collection-heading" className="flex items-center gap-2 font-serif text-headline-lg-mobile text-on-surface">
            <Bookmark aria-hidden="true" size={22} strokeWidth={1.75} className="text-secondary" />
            {me.collectionHeading}
          </h2>
          {saved.length > PREVIEW_COUNT ? (
            <Link href="/me/saved" className="inline-flex min-h-12 items-center gap-1.5 rounded px-2 text-label-md text-primary hover:underline">
              {me.seeAll}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </Link>
          ) : null}
        </div>
        {saved.length ? (
          <>
            <SavedList items={saved.slice(0, PREVIEW_COUNT)} dict={dict} locale={locale} />
            <ButtonLink href="/me/saved" variant="secondary" className="self-start">
              {me.seeAll}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
            </ButtonLink>
          </>
        ) : (
          <p className="rounded border border-dashed border-outline bg-surface-container-low p-5 text-body-md text-on-surface-variant">
            {me.collectionEmpty}
          </p>
        )}
      </section>
    </div>
  );
}
