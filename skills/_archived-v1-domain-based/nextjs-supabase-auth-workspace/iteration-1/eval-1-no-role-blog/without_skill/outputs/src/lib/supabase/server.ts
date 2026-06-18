/**
 * Supabase client for use in Server Components, Route Handlers, and
 * Server Actions.
 *
 * IMPORTANT: Server Components cannot write cookies (Next.js restriction).
 * The try/catch around `set`/`remove` swallows the error that occurs when
 * this client is used from a Server Component during rendering. As long as
 * the middleware below is also refreshing the session, this is safe — the
 * middleware is the one place that reliably persists refreshed tokens.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore because the
            // middleware refreshes the session on every navigation.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above — ignore when called from a Server Component.
          }
        },
      },
    }
  );
}
