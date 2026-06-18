// app/auth/callback/route.ts
// Required whenever any login method other than signInWithPassword is used
// (Google OAuth and/or magic links). Supabase redirects here with a
// temporary `code` after the user approves the Google consent screen (or
// clicks a magic link); this route exchanges that code for a real session.
// Without this route, the "Continue with Google" button appears to work
// but the user never actually ends up logged in.
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // `next` lets us send the user back to wherever they originally tried to
  // go (set by middleware.ts when it redirected to /login).
  const next = searchParams.get("next") ?? "/onboarding"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // New Google sign-ins won't have a role yet — middleware will catch
      // that and bounce to /onboarding if `next` itself isn't reachable yet,
      // but we default to /onboarding here anyway for first-time OAuth users.
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Code missing or exchange failed (expired/used code, tampered link, etc.)
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
