import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and keeps the
 * request/response cookies in sync. This MUST run in middleware so that
 * Server Components (which cannot write cookies themselves) always see
 * an up-to-date session.
 *
 * Returns the NextResponse to send onward (either a pass-through response
 * or a redirect for protected routes).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookie writes onto both the incoming request (so later
          // reads in this same request see fresh values) and the outgoing
          // response (so the browser actually receives them).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: avoid writing logic between createServerClient and this
  // getUser() call. A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/update-password");

  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api");

  // Gate everything except auth routes and static assets behind a session.
  // Adjust this allowlist to match your app's actual public routes.
  if (!user && !isAuthRoute && !isPublicAsset) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: Always return the supabaseResponse object as-is. If a new
  // response object is created instead, make sure to:
  // 1. Pass `request` when creating the new response
  // 2. Copy over the cookies set above
  // 3. Avoid changing supabaseResponse's cookies beyond what's necessary
  return supabaseResponse;
}
