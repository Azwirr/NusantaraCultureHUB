import "server-only";

import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { getSessionUser, type SessionUser } from "@/lib/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getInitials } from "@/lib/initials";

type AccountCopy = Dictionary["account"];

const circleLink =
  "press inline-flex size-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface";

/** Suspense fallback and static shell: a generic account icon linking to /me. */
export function AccountButtonFallback({ copy }: { copy: AccountCopy }) {
  return (
    <Link href="/me" aria-label={copy.generic} className={circleLink}>
      <UserRound aria-hidden="true" size={22} strokeWidth={1.75} />
    </Link>
  );
}

/**
 * Reads the session, so it must render inside <Suspense>. Signed in: the
 * nickname's initials linking to /me. Guest: a "Sign in" link to /login.
 */
export async function AccountButton({ copy }: { copy: AccountCopy }) {
  let user: SessionUser | null = null;
  try {
    user = await getSessionUser();
  } catch (error) {
    // Let Next.js control-flow errors through; otherwise a session lookup
    // failure must not take down the header on every page.
    unstable_rethrow(error);
    console.error("AccountButton: session lookup failed", error);
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="press inline-flex min-h-12 shrink-0 items-center gap-2 rounded border-[1.5px] border-secondary px-3 text-label-md text-on-surface hover:bg-secondary-container hover:text-on-secondary-container"
      >
        <LogIn aria-hidden="true" size={18} strokeWidth={1.75} />
        {copy.signIn}
      </Link>
    );
  }

  const initials = getInitials(user.username);
  return (
    <Link href="/me" className={circleLink}>
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full border border-ink bg-primary-container text-label-md text-on-primary-container"
      >
        {initials ?? <UserRound size={20} strokeWidth={1.75} />}
      </span>
      {/* The nickname is user-entered text: rendered as a plain text node only. */}
      <span className="sr-only">
        {copy.myAccount}
        {user.username ? `: ${user.username}` : ""}
      </span>
    </Link>
  );
}
