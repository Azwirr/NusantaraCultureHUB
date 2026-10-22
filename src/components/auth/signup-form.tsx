"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { Button, ButtonLink } from "@/components/button";
import { type AuthField, type AuthFormState, signUp } from "@/lib/auth-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";

import { FormField } from "./form-field";
import { FormMessage } from "./form-message";

export type SignupCopy = Pick<
  Dictionary["auth"],
  "signup" | "fields" | "errors" | "checkEmailTitle" | "checkEmailBody"
>;

const initialState: AuthFormState = { status: "idle" };

export function SignupForm({ copy }: { copy: SignupCopy }) {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  // Controlled so these survive React's form reset after a failed attempt.
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const invalid = (field: AuthField) => state.status === "error" && (state.fields?.includes(field) ?? false);

  if (state.status === "check_email") {
    return (
      <div className="flex flex-col gap-5">
        <FormMessage tone="success" title={copy.checkEmailTitle}>
          {copy.checkEmailBody}
        </FormMessage>
        <ButtonLink href="/login" variant="secondary" className="w-full">
          {copy.signup.switchLink}
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.status === "error" ? (
        <FormMessage id={errorId} tone="error">
          {copy.errors[state.code]}
        </FormMessage>
      ) : null}

      <FormField
        id={`${baseId}-username`}
        name="username"
        type="text"
        autoComplete="nickname"
        autoCapitalize="none"
        spellCheck={false}
        required
        minLength={3}
        maxLength={24}
        label={copy.fields.username}
        hint={copy.fields.usernameHint}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        invalid={invalid("username")}
        errorId={errorId}
      />
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
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={72}
        label={copy.fields.password}
        hint={copy.fields.passwordHint}
        invalid={invalid("password") || (state.status === "error" && state.code === "weak_password")}
        errorId={errorId}
      />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.signup.pending : copy.signup.submit}
      </Button>

      <p className="text-center text-body-md text-on-surface-variant">
        {copy.signup.switchPrompt}{" "}
        <Link href="/login" className="inline-flex min-h-12 items-center px-1 font-semibold text-primary underline">
          {copy.signup.switchLink}
        </Link>
      </p>
    </form>
  );
}
