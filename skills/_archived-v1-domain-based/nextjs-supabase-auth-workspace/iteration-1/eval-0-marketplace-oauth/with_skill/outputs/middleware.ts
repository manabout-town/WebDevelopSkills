// middleware.ts
// First line of defense: redirects logged-out users away from protected
// routes, and routes logged-in users with no role yet into onboarding.
// This is NOT the real security boundary — RLS (sql/rls_policies.sql) is.
// If this middleware is ever bypassed (matcher misconfiguration, edge
// runtime quirks, caching), RLS still protects the data.
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

// Routes anyone (logged in or not) can reach.
const PUBLIC_PATHS = ["/", "/login", "/signup"]

function isPublicPath(path: string) {
  return (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/auth/") || // OAuth / magic-link callback route
    path.startsWith("/_next/") ||
    path.startsWith("/api/public/")
  )
}

// Role -> default dashboard. Keep in sync with app/(seller)/ and app/(buyer)/
// route groups.
const ROLE_TO_DASHBOARD: Record<string, string> = {
  seller: "/seller/dashboard",
  buyer: "/buyer/dashboard",
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1) Logged-out users hitting a protected route -> /login
  if (!user && !isPublicPath(path)) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("next", path)
    // Carry forward any refreshed cookies onto the redirect response.
    return NextResponse.redirect(redirectUrl, { headers: response.headers })
  }

  if (user) {
    // Look up role. Cheap `users` table lookup for now — if this becomes a
    // hot path, move role into a JWT custom claim so it can be read from
    // the session without a DB round trip.
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role as "seller" | "buyer" | undefined

    // 2) Logged-in but no role yet -> must finish onboarding first,
    //    unless they're already on /onboarding or hitting auth/public routes.
    if (!role && path !== "/onboarding" && !isPublicPath(path)) {
      const redirectUrl = new URL("/onboarding", request.url)
      return NextResponse.redirect(redirectUrl, { headers: response.headers })
    }

    // 3) Logged-in users visiting /login or /signup -> send to their dashboard.
    if (role && (path === "/login" || path === "/signup")) {
      const redirectUrl = new URL(ROLE_TO_DASHBOARD[role], request.url)
      return NextResponse.redirect(redirectUrl, { headers: response.headers })
    }

    // 4) Role-scoped route groups: a buyer should never reach /seller/*, and
    //    vice versa. Physical route groups (app/(seller)/, app/(buyer)/) map
    //    1:1 to these path prefixes so it's obvious from folder structure
    //    which role a page belongs to.
    if (role === "buyer" && path.startsWith("/seller")) {
      return NextResponse.redirect(new URL("/buyer/dashboard", request.url), {
        headers: response.headers,
      })
    }
    if (role === "seller" && path.startsWith("/buyer")) {
      return NextResponse.redirect(new URL("/seller/dashboard", request.url), {
        headers: response.headers,
      })
    }
  }

  // IMPORTANT: return the same `response` object so refreshed auth cookies
  // make it back to the browser. Do not replace it with a fresh
  // NextResponse.next() here.
  return response
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and image optimization files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
