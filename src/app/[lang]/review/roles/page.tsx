import { Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { ActionForm } from "@/components/review/action-form";
import type { ReviewMessageCopy } from "@/components/review/review-message";
import { ReviewNav } from "@/components/review/review-nav";
import { requireOwner } from "@/lib/auth";
import { type Dictionary, getDictionary } from "@/lib/i18n/dictionaries";
import { getStaff } from "@/lib/review";
import { grantRole, revokeRole } from "@/lib/review-actions";

export async function generateMetadata(): Promise<Metadata> {
  const { review } = await getDictionary();
  return { title: review.roles.title, robots: { index: false, follow: false } };
}

export default async function RolesPage() {
  const dict = await getDictionary();
  return (
    <div className="page-container py-8 md:py-12">
      <PageHeader kicker={dict.review.kicker} title={dict.review.roles.title} lead={dict.review.roles.lead} />
      <Suspense
        fallback={
          <p role="status" className="text-body-md text-on-surface-variant">
            {dict.review.loading}
          </p>
        }
      >
        <RolesPanel dict={dict} />
      </Suspense>
    </div>
  );
}

/** Owner only. RLS and guard_user_roles enforce it again in the database. */
async function RolesPanel({ dict }: { dict: Dictionary }) {
  await requireOwner("/review/roles");
  const staff = await getStaff();
  const { review, roles, language, auth } = dict;
  const copy = review.roles;
  const messages: ReviewMessageCopy = {
    errors: review.errors,
    fields: review.detail.fields,
    idCode: language.idCode,
    enCode: language.enCode,
  };

  return (
    <>
      <ReviewNav copy={review.nav} current="roles" isOwner />
      <p className="mb-6 flex max-w-3xl items-start gap-3 rounded border border-ink bg-surface-container-low p-4 text-body-md text-on-surface">
        <Users aria-hidden="true" size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
        <span>{copy.fourEyes}</span>
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left">
            <caption className="px-5 pt-5 pb-3 text-left font-serif text-headline-md text-on-surface">
              {copy.staffCaption}
            </caption>
            <thead>
              <tr className="border-y border-ink bg-surface-container-low">
                {[copy.nickname, copy.rolesHeader, copy.actionsHeader].map((label) => (
                  <th key={label} scope="col" className="px-4 py-3 text-label-sm uppercase text-on-surface-variant">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.userId} className="border-b border-ink align-top last:border-b-0">
                  {/* Nicknames are user-entered: plain text only. */}
                  <th scope="row" className="px-4 py-3 text-body-md font-normal break-words text-on-surface">
                    {member.nickname ?? review.detail.unknownPerson}
                  </th>
                  <td className="px-4 py-3 text-body-md text-on-surface">
                    {member.roles.map((role) => roles[role]).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {member.roles.map((role) => (
                        <ActionForm
                          key={role}
                          action={revokeRole}
                          hidden={{ user_id: member.userId, role }}
                          submitLabel={copy.revoke.replace("{role}", roles[role])}
                          pendingLabel={copy.pending}
                          success={copy.revoked}
                          copy={messages}
                          variant="ghost"
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card as="section" aria-labelledby="grant-heading" className="flex flex-col gap-4 p-5">
          <h2 id="grant-heading" className="font-serif text-headline-md text-on-surface">
            {copy.grantHeading}
          </h2>
          <ActionForm
            action={grantRole}
            hidden={{}}
            submitLabel={copy.grant}
            pendingLabel={copy.pending}
            success={copy.granted}
            copy={messages}
            variant="primary"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="grant-nickname" className="text-label-md text-on-surface">
                {copy.nickname}
              </label>
              <input
                id="grant-nickname"
                name="nickname"
                required
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                minLength={3}
                maxLength={24}
                aria-describedby="grant-nickname-hint"
                className="min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface"
              />
              <p id="grant-nickname-hint" className="text-body-sm text-on-surface-variant">
                {copy.nicknameHint} {auth.fields.usernameHint}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="grant-role" className="text-label-md text-on-surface">
                {copy.role}
              </label>
              <select
                id="grant-role"
                name="role"
                defaultValue="reviewer"
                className="min-h-12 w-full rounded border border-outline bg-surface-container-lowest px-3 text-body-md text-on-surface"
              >
                <option value="reviewer">{roles.reviewer}</option>
                <option value="owner">{roles.owner}</option>
              </select>
            </div>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
