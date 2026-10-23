import { ClipboardList, LogOut, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { NicknameForm } from "@/components/auth/nickname-form";
import { Button, ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { Chip } from "@/components/chip";
import { PageHeader } from "@/components/page-header";
import { isStaff, requireUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { type Dictionary, getDictionary } from "@/lib/i18n/dictionaries";
import { getInitials } from "@/lib/initials";

export async function generateMetadata(): Promise<Metadata> {
  const { me } = await getDictionary();
  return { title: me.title, robots: { index: false, follow: false } };
}

export default async function MePage() {
  const dict = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.me.kicker} title={dict.me.title} />
      <Suspense fallback={<MemberSkeleton label={dict.me.loading} />}>
        <MemberPanel dict={dict} />
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

/** Reads the session, so it renders inside <Suspense>. Guests go to /login. */
async function MemberPanel({ dict }: { dict: Dictionary }) {
  const user = await requireUser("/me");
  const initials = getInitials(user.username);
  const roleLabels = user.roles.length > 0 ? user.roles.map((role) => dict.roles[role]) : [dict.me.memberRole];

  // One fixed place in the tree, so the form keeps its "saved" message when
  // saving flips needsNickname and the page refreshes.
  const nicknameForm = (
    <NicknameForm
      copy={{
        ...dict.me.nickname,
        label: dict.auth.fields.username,
        hint: dict.auth.fields.usernameHint,
        errors: dict.auth.errors,
      }}
      current={user.username ?? ""}
      required={user.needsNickname}
    />
  );

  return (
    <Card className="flex max-w-xl flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full border border-ink bg-primary-container font-serif text-headline-md text-on-primary-container"
        >
          {initials ?? <UserRound size={28} strokeWidth={1.75} />}
        </span>
        <dl className="flex min-w-0 flex-col gap-3">
          <div>
            <dt className="text-label-sm uppercase text-on-surface-variant">{dict.me.usernameLabel}</dt>
            {/* User-entered nickname: a plain text node, never HTML. */}
            <dd className="break-words font-serif text-headline-md text-on-surface">
              {user.username ?? dict.me.noUsername}
            </dd>
          </div>
          <div>
            <dt className="text-label-sm uppercase text-on-surface-variant">{dict.me.rolesLabel}</dt>
            <dd className="mt-1">
              <ul className="flex flex-wrap gap-2">
                {roleLabels.map((label) => (
                  <li key={label}>
                    <Chip tone={user.roles.length > 0 ? "primary" : "neutral"}>{label}</Chip>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      {nicknameForm}

      <div className="flex flex-wrap gap-3">
        {isStaff(user) ? (
          <ButtonLink href="/review">
            <ClipboardList aria-hidden="true" size={18} strokeWidth={1.75} />
            {dict.me.reviewLink}
          </ButtonLink>
        ) : null}
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            <LogOut aria-hidden="true" size={18} strokeWidth={1.75} />
            {dict.me.signOut}
          </Button>
        </form>
      </div>
    </Card>
  );
}
