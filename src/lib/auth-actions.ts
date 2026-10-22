"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/** Every code needs a message in both dictionaries (dict.auth.errors). */
export type AuthErrorCode =
  | "invalid_input"
  | "invalid_credentials"
  | "email_not_confirmed"
  | "weak_password"
  | "email_taken"
  | "link_invalid"
  | "rate_limited"
  | "unknown";

export type AuthField = "username" | "email" | "password";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; code: AuthErrorCode; fields?: AuthField[] }
  | { status: "check_email" };

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(72);
// "use server" files may only export async functions, so schemas stay local.
/** Nickname only (PRD privacy rule): no real names, no spaces, no markup. */
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,24}$/);

const signInSchema = z.object({ email, password: z.string().min(1).max(72) });
const signUpSchema = z.object({ username: usernameSchema, email, password });

function invalidFields(error: z.ZodError): AuthField[] {
  return [...new Set(error.issues.map((issue) => issue.path[0]).filter(Boolean))] as AuthField[];
}

function mapAuthError(code: string | undefined, status: number | undefined): AuthErrorCode {
  if (code === "invalid_credentials") return "invalid_credentials";
  if (code === "email_not_confirmed") return "email_not_confirmed";
  if (code === "weak_password") return "weak_password";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || status === 429) {
    return "rate_limited";
  }
  return "unknown";
}

async function siteOrigin(): Promise<string> {
  // SITE_URL is preferred so a forged Host header cannot change email links.
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", code: "invalid_input", fields: invalidFields(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", code: mapAuthError(error.code, error.status) };

  redirect(safeNextPath(formData.get("next")));
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", code: "invalid_input", fields: invalidFields(parsed.error) };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Stored in auth metadata; handle_new_user copies it into profiles.
      data: { username: parsed.data.username },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=%2Fme`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { status: "error", code: "email_taken", fields: ["email"] };
    }
    if (error.code === "email_address_invalid") {
      return { status: "error", code: "invalid_input", fields: ["email"] };
    }
    return { status: "error", code: mapAuthError(error.code, error.status) };
  }

  // With email confirmation on, there is no session until the link is used.
  if (!data.session) return { status: "check_email" };
  redirect("/me");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
