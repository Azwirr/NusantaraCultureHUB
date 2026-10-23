"use client";

import { useActionState, useId, useState } from "react";

import { Button } from "@/components/button";
import { type NicknameFormState, setNickname } from "@/lib/auth-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";

import { FormField } from "./form-field";
import { FormMessage } from "./form-message";

export type NicknameCopy = Dictionary["me"]["nickname"] & {
  label: string;
  hint: string;
  errors: Dictionary["auth"]["errors"];
};

const initialState: NicknameFormState = { status: "idle" };

/**
 * Choose or change the nickname. When `required` (Google sign-in, or a
 * nickname that was taken) it is highlighted and explains why.
 */
export function NicknameForm({
  copy,
  current,
  required,
}: {
  copy: NicknameCopy;
  current: string;
  required: boolean;
}) {
  const [state, formAction, pending] = useActionState(setNickname, initialState);
  // Controlled so the value survives React's form reset after a failed attempt.
  const [value, setValue] = useState(current);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const messageId = `${baseId}-message`;

  return (
    <section
      aria-labelledby={headingId}
      className={[
        "flex flex-col gap-4 rounded border p-5",
        required ? "border-primary bg-primary-container/40" : "border-ink",
      ].join(" ")}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="font-serif text-headline-md text-on-surface">
          {required ? copy.title : copy.editTitle}
        </h2>
        {required ? <p className="text-body-md text-on-surface-variant">{copy.body}</p> : null}
      </div>

      <form action={formAction} noValidate className="flex flex-col gap-4">
        {state.status === "error" ? (
          <FormMessage id={messageId} tone="error">
            {copy.errors[state.code]}
          </FormMessage>
        ) : null}
        {state.status === "saved" ? <FormMessage tone="success">{copy.saved}</FormMessage> : null}

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
          label={copy.label}
          hint={copy.hint}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          invalid={state.status === "error"}
          errorId={messageId}
        />
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? copy.pending : copy.submit}
        </Button>
      </form>
    </section>
  );
}
