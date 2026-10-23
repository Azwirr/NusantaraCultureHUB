import { NextResponse, type NextRequest } from "next/server";

import { callbackFailure } from "@/lib/auth-callback";
import { safeNextPath } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation links and Google sign-in land here with a PKCE code.
 * Exchange it for a session cookie, then continue to a same-origin path only
 * (no open redirects). Members who still need a nickname go to /me first.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code && !searchParams.get("error")) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase.from("profiles").select("nickname_set").maybeSingle();
      return NextResponse.redirect(new URL(profile && !profile.nickname_set ? "/me" : next, origin));
    }
  }

  const failure = callbackFailure(searchParams.get("via"), searchParams.get("error"));
  return NextResponse.redirect(new URL(`/login?error=${failure}`, origin));
}
