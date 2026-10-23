import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { hasSessionCookie } from "@/lib/supabase/cookies";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "reviewer" | "owner";

export type SessionUser = {
  id: string;
  /** Member nickname. User-entered text: render as a plain text node only. */
  username: string | null;
  /** Read from user_roles on the server. Never taken from the client. */
  roles: AppRole[];
  /** True until the member chooses a nickname (Google sign-in, or a taken one). */
  needsNickname: boolean;
};

function isAppRole(value: unknown): value is AppRole {
  return value === "reviewer" || value === "owner";
}

/**
 * The single place that reads the session (Data Access Layer). Verifies the
 * JWT with getClaims() and loads roles from user_roles through RLS.
 * Deduplicated per request with React cache().
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Guests carry no Supabase auth cookie: skip the client entirely.
  const cookieStore = await cookies();
  if (!hasSessionCookie(cookieStore.getAll())) return null;
  // Session checks compare token expiry with the clock, so they must run at
  // request time only, never in a prerender.
  await connection();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (error || !userId) return null;

  const [profile, roleRows] = await Promise.all([
    supabase.from("profiles").select("username, nickname_set").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  return {
    id: userId,
    username: profile.data?.username ?? null,
    roles: (roleRows.data ?? []).map((row) => row.role).filter(isAppRole),
    needsNickname: profile.data ? !profile.data.nickname_set : false,
  };
});

export function isStaff(user: SessionUser | null): boolean {
  return !!user && (user.roles.includes("reviewer") || user.roles.includes("owner"));
}

/** For pages that need a signed-in member. Sends guests to /login. */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/**
 * For reviewer-only pages; call it inside a <Suspense> boundary. Guests are
 * redirected to /login (the proxy already does this with a 307 when there is
 * no session cookie) and signed-in non-staff get the not-found UI. Because
 * the static shell has already streamed, that answer arrives with HTTP 200
 * and the shell's heading is visible, so never put data in the shell. RLS
 * still enforces access in the database.
 */
export async function requireStaff(nextPath = "/review"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (!isStaff(user)) notFound();
  return user;
}

/** Owner-only pages (role grants). Same streaming caveats as requireStaff. */
export async function requireOwner(nextPath: string): Promise<SessionUser> {
  const user = await requireStaff(nextPath);
  if (!user.roles.includes("owner")) notFound();
  return user;
}
