// lib/supabase/server.ts
// Server Component / Server Action client (anon key + cookie-based session).
// Runs as the logged-in user, subject to RLS — same trust level as the
// browser client, just usable on the server.
//
// Server Components cannot write cookies (Next.js restriction), so `setAll`
// is a no-op here. Token refresh on the server is handled by the middleware
// client (lib/supabase/middleware.ts), not this one.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Intentionally empty: Server Components can't set cookies.
          // Session refresh is handled by middleware.ts on every request.
        },
      },
    }
  )
}
