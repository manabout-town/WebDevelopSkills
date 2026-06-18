import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions.
 *
 * IMPORTANT: `setAll` actually writes cookies here (the original
 * implementation was a no-op, which silently breaks session refresh —
 * users would get logged out unexpectedly because refreshed auth
 * tokens never made it back into the response cookies).
 *
 * Server Components cannot set cookies directly, so the try/catch below
 * swallows the expected "cookies can only be modified in a Server Action
 * or Route Handler" error there. Session refresh in that case is handled
 * by middleware.ts.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore because
            // middleware.ts refreshes the session and rewrites cookies
            // on every request.
          }
        },
      },
    }
  )
}
