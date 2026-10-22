import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { AUTH_COOKIE_OPTIONS } from "./cookies";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Supabase client bound to the visitor's session cookies. Every query runs
 * as that visitor, so RLS and the guard_approval trigger always apply.
 * Create one per request; never share it across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. The proxy refreshes the
          // session on every navigation, so this is safe to ignore here.
        }
      },
    },
  });
}
