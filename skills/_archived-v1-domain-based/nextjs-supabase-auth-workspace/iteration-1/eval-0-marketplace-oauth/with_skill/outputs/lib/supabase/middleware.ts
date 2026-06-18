// lib/supabase/middleware.ts
// Middleware-only client. This is the ONLY place that can refresh an
// expired auth token on every request. The refreshed cookies must be
// written to BOTH `request` and `response` — request so any downstream
// Server Component sees the new token this same request, and response so
// the browser receives the refreshed cookie. Using the plain server client
// here instead would cause "I'm logged in but a refresh logs me out" bugs.
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Recreate response from the updated request so it carries the
          // new cookies forward to whatever runs next.
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}
