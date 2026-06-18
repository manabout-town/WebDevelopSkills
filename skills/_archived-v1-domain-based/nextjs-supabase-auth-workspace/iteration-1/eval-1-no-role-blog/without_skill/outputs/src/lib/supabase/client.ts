/**
 * Supabase client for use in Client Components ("use client").
 *
 * This client reads/writes the session via browser cookies (handled
 * internally by @supabase/ssr) so it stays in sync with the server-side
 * client and the middleware.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
