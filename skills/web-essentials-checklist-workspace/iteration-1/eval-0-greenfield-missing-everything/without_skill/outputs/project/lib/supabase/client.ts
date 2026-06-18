import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

/**
 * Supabase client for use in Client Components ("use client").
 * Safe to call multiple times — @supabase/ssr handles caching internally,
 * but we still avoid creating a new client on every render by letting
 * callers memoize if needed.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
