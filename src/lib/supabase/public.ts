import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * A guest's view of the database: the publishable key and no session, so RLS
 * returns approved rows only. It reads no cookies, which lets public pages
 * cache what it returns ("use cache") and prerender it.
 */
export function createPublicClient() {
  return createClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
