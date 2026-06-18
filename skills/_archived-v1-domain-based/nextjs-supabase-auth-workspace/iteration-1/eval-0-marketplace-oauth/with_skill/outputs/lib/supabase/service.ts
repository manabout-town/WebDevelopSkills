// lib/supabase/service.ts
// Service-role client — BYPASSES RLS ENTIRELY. Server-only code path
// (Server Actions, Route Handlers). Never import this from a Client
// Component or from middleware, and never let SUPABASE_SERVICE_ROLE_KEY
// leak into a NEXT_PUBLIC_ variable.
//
// Use only when the action genuinely cannot be done under the user's own
// RLS-scoped permissions — e.g. creating the very first profile row during
// onboarding (before the user has a role, RLS policies that key off role
// can't yet apply to them), or trusted batch/system jobs.
//
// Every call site that imports this file should carry a comment explaining
// *why* RLS had to be bypassed there.
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only env var, never NEXT_PUBLIC_
  )
}
