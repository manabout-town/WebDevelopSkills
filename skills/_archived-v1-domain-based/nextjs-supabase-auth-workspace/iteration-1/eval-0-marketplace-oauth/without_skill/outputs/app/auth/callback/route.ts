import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / email-link callback handler.
 *
 * Google sign-in (and magic links / email confirmations) redirect here with
 * a `code` query param. We exchange it for a session, then route the user
 * onward:
 *   - no profile.role yet -> /onboarding/role (first-time Google sign-in,
 *     or email signup that hasn't picked a role yet)
 *   - profile.role set -> /dashboard/<role>
 *
 * `next` lets callers override the default destination (e.g. deep-linking
 * back to a specific listing after login), but we still enforce onboarding
 * first.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const destination = profile?.role
        ? `/dashboard/${profile.role}`
        : "/onboarding/role";

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Respect `next` only when it's a same-app relative path and the user
      // already has a role; otherwise always force onboarding first.
      const finalPath =
        profile?.role && next.startsWith("/") ? next : destination;

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${finalPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${finalPath}`);
      } else {
        return NextResponse.redirect(`${origin}${finalPath}`);
      }
    }
  }

  // Auth failed (bad/expired code, denied consent, etc.)
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
