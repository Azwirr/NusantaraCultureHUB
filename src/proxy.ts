import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isLocale, LOCALE_COOKIE, localeFromAcceptLanguage } from "@/lib/i18n/config";
import { AUTH_COOKIE_OPTIONS, hasSessionCookie } from "@/lib/supabase/cookies";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Runs before every page and API request:
 * 1. Rewrites unprefixed page URLs (/library) to their locale route
 *    (/id/library) so public URLs match the build plan while each language
 *    can still be prerendered.
 * 2. Refreshes the Supabase session cookie, because Server Components
 *    cannot write cookies themselves.
 *
 * Authorization is NOT decided here. Pages, route handlers and server actions
 * check the session themselves, and RLS is the final gate.
 */
export async function proxy(request: NextRequest) {
  const signedIn = hasSessionCookie(request.cookies.getAll());

  // Optimistic check only: guests with no session cookie get a real redirect
  // instead of a streamed one. The pages still verify the session and role.
  const signInRedirect = signedIn ? null : guestRedirect(request);
  if (signInRedirect) return NextResponse.redirect(signInRedirect);

  const rewriteUrl = localeRewrite(request);
  const makeResponse = () =>
    rewriteUrl ? NextResponse.rewrite(rewriteUrl, { request }) : NextResponse.next({ request });

  let response = makeResponse();
  if (!signedIn) return response;

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          if (value === "") request.cookies.delete(name);
          else request.cookies.set(name, value);
        }
        response = makeResponse();
        for (const { name, value, options } of cookiesToSet) {
          if (value === "" || options?.maxAge === 0) {
            // Next drops Max-Age=0 when it merges proxy cookies into the page
            // response, which would recreate the cookie. An epoch expiry survives.
            response.cookies.set(name, "", { ...options, maxAge: 0, expires: new Date(0) });
          } else {
            response.cookies.set(name, value, options);
          }
        }
        // Responses that carry auth cookies must never be cached by a CDN.
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // Verifies the JWT and refreshes it when expired. Do not remove.
  await supabase.auth.getClaims();

  return response;
}

/** Sections that need a signed-in user, without their locale prefix. */
const SIGNED_IN_SECTIONS = ["/me", "/review"];

function guestRedirect(request: NextRequest): URL | null {
  const segments = request.nextUrl.pathname.split("/");
  const path = isLocale(segments[1]) ? `/${segments.slice(2).join("/")}` : request.nextUrl.pathname;
  const normalized = path.replace(/\/+$/, "") || "/";
  const protectedPath = SIGNED_IN_SECTIONS.some((root) => normalized === root || normalized.startsWith(`${root}/`));
  if (!protectedPath) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(normalized)}`;
  return url;
}

function localeRewrite(request: NextRequest): URL | null {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/auth/")) return null;

  const firstSegment = pathname.split("/")[1];
  if (isLocale(firstSegment)) return null;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : localeFromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return url;
}

export const config = {
  matcher: [
    // Everything except Next internals and static files served from /public.
    "/((?!_next/static|_next/image|try-on/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|webmanifest|woff2?)$).*)",
  ],
};
