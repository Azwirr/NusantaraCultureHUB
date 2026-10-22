"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useId, useState } from "react";

import { Button } from "@/components/button";
import { type AuthField, type AuthFormState, signIn } from "@/lib/auth-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";
import { safeNextPath } from "@/lib/safe-redirect";

import { FormField } from "./form-field";
import { FormMessage } from "./form-message";

export type LoginCopy = Pick<Dictionary["auth"], "login" | "fields" | "errors">;

const initialState: AuthFormState = { status: "idle" };

/** Shown when /auth/callback could not use a confirmation link (?error=link). */
function LinkErrorNotice({ message }: { message: string }) {
  const searchParams = useSearchParams();
  return searchParams.get("error") === "link" ? <FormMessage tone="error">{message}</FormMessage> : null;
}

/** Carries ?next= through sign-in. signIn() re-checks it with safeNextPath. */
function NextPathInput() {
  const searchParams = useSearchParams();
  return <input type="hidden" name="next" value={safeNextPath(searchParams.get("next"))} />;
}

export function LoginForm({ copy }: { copy: LoginCopy }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  // Controlled so the email survives React's form reset after a failed attempt.
  const [email, setEmail] = useState("");
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const invalid = (field: AuthField) => state.status === "error" && (state.fields?.includes(field) ?? false);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "error" ? (
        <FormMessage id={errorId} tone="error">
          {copy.errors[state.code]}
        </FormMessage>
      ) : (
        <Suspense fallback={null}>
          <LinkErrorNotice message={copy.errors.link_invalid} />
        </Suspense>
      )}

      <Suspense fallback={<input type="hidden" name="next" value="/me" />}>
        <NextPathInput />
      </Suspense>

      <FormField
        id={`${baseId}-email`}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        spellCheck={false}
        required
        label={copy.fields.email}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        invalid={invalid("email")}
        errorId={errorId}
      />
      <FormField
        id={`${baseId}-password`}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        label={copy.fields.password}
        invalid={invalid("password")}
        errorId={errorId}
      />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.login.pending : copy.login.submit}
      </Button>

      <p className="text-center text-body-md text-on-surface-variant">
        {copy.login.switchPrompt}{" "}
        <Link href="/signup" className="inline-flex min-h-12 items-center px-1 font-semibold text-primary underline">
          {copy.login.switchLink}
        </Link>
      </p>
    </form>
  );
}
