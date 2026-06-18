// lib/supabase/client.ts
// Browser client (anon key). Use this in "use client" components only.
// All queries made with this client run under RLS as the logged-in user —
// every query issued through this client MUST be safe to run under RLS.
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
