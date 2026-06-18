/**
 * Supabase auth callback route.
 *
 * Needed for flows where Supabase redirects back to your app with a `code`
 * param to exchange for a session: email confirmation links, magic links,
 * password-reset links, and OAuth providers. Not strictly required for a
 * bare email/password signInWithPassword flow (that one sets cookies
 * directly via the browser client), but any real app ends up needing this
 * sooner or later, so it's included for completeness.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
