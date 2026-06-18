/**
 * Root middleware — runs on every request that matches `config.matcher`
 * below, before any page or route handler executes.
 *
 * Responsibilities:
 *  1. Keep the Supabase auth session fresh (via updateSession).
 *  2. Gate the write/post pages: if there's no logged-in user, redirect
 *     to /login. No roles/permissions involved — just "are you logged in".
 *
 * Note: this is a *defense-in-depth* check, not the only line of defense.
 * Any Server Action / Route Handler that actually mutates posts should also
 * re-check `supabase.auth.getUser()` server-side, since middleware can be
 * bypassed by calling APIs directly. Supabase Row Level Security policies
 * on the `posts` table are the real backstop.
 */
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Add any other "must be logged in" paths here as the app grows.
const PROTECTED_PATHS = ["/write"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !user) {
    const redirectUrl = new URL("/login", request.url);
    // Remember where the user was headed so /login can send them back
    // after a successful sign-in.
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     *
     * We intentionally still run on most paths (not just /write) so the
     * session-refresh logic keeps cookies fresh app-wide. The actual
     * redirect-to-login decision is scoped to PROTECTED_PATHS above.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
