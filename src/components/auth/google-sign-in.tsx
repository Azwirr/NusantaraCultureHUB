"use client";

import { useFormStatus } from "react-dom";

import { buttonClasses } from "@/components/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";

import { NextPathField } from "./next-path-input";

export type GoogleCopy = Dictionary["auth"]["google"];

/** Google's "G" mark in its brand colours (Google Sign-In branding guidelines). */
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GoogleButton({ copy }: { copy: GoogleCopy }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClasses("secondary", "w-full")}
    >
      <GoogleMark />
      {pending ? copy.pending : copy.continue}
    </button>
  );
}

/**
 * "Continue with Google" plus the "or" divider above an email form. Signs in
 * or signs up: a first Google sign-in creates the account, and the member
 * then chooses a nickname on /me.
 */
export function GoogleSignIn({ copy, carryNext = false }: { copy: GoogleCopy; carryNext?: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      <form action={signInWithGoogle} className="flex flex-col gap-2">
        {carryNext ? <NextPathField /> : null}
        <GoogleButton copy={copy} />
        <p className="text-body-sm text-on-surface-variant">{copy.privacyNote}</p>
      </form>
      <div className="flex items-center gap-3" role="separator" aria-label={copy.divider}>
        <span aria-hidden="true" className="h-px flex-1 bg-outline-variant" />
        <span aria-hidden="true" className="text-label-sm uppercase text-on-surface-variant">
          {copy.divider}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-outline-variant" />
      </div>
    </div>
  );
}
