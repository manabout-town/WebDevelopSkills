import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route-level access rules (auth required, role required, onboarding
 * completed). Called from middleware.ts at the project root.
 *
 * IMPORTANT: Do not add logic between createServerClient and the
 * supabase.auth.getUser() call below — see comment inline.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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

  // Do not run code between createServerClient and getUser(). A simple
  // mistake here could make it very hard to debug issues with users being
  // randomly logged out. getUser() revalidates the JWT against Supabase
  // Auth servers on every request, unlike getSession() which only reads
  // the (possibly stale/forged) cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth");

  const isPublicRoute =
    isAuthRoute || pathname === "/" || pathname.startsWith("/api/auth");

  // Not logged in and hitting a protected route -> send to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Logged in: check profile/role to decide onboarding vs dashboard routing.
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const hasRole = !!profile?.role;

    // Logged-in users should not see login/signup again.
    if (isAuthRoute && !pathname.startsWith("/auth/callback")) {
      const url = request.nextUrl.clone();
      url.pathname = hasRole ? `/dashboard/${profile!.role}` : "/onboarding/role";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Force role selection before any dashboard access.
    if (!hasRole && pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/role";
      return NextResponse.redirect(url);
    }

    // Prevent cross-role access, e.g. a buyer hitting /dashboard/seller.
    if (hasRole && pathname.startsWith("/dashboard")) {
      const segments = pathname.split("/"); // ["", "dashboard", "seller", ...]
      const requestedRole = segments[2];
      if (
        (requestedRole === "seller" || requestedRole === "buyer") &&
        requestedRole !== profile!.role
      ) {
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${profile!.role}`;
        return NextResponse.redirect(url);
      }
    }

    // Already onboarded users shouldn't linger on the onboarding screen.
    if (hasRole && pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${profile!.role}`;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: Return supabaseResponse as-is (or a NextResponse built from
  // it) so the refreshed auth cookies actually reach the browser. If you
  // need to return a different response, copy supabaseResponse.cookies
  // onto it first.
  return supabaseResponse;
}
