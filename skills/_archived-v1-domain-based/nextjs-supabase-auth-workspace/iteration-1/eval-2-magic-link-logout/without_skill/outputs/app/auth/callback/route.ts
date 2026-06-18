import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared callback for any Supabase email link that uses the PKCE /
 * "code" flow: magic-link sign-in, signup confirmation, and
 * password-reset links all land here with a `?code=...` param.
 *
 * We exchange the code for a session (this sets the auth cookies via
 * the server client's cookie adapter) and then redirect onward.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // `next` lets each flow choose where to land after exchange:
  //   - magic link  -> "/"
  //   - password reset -> "/update-password"
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Respect a same-origin `next` only, to avoid open-redirects.
      const safeNext = next.startsWith("/") ? next : "/";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Missing/invalid/expired code - send the user to a friendly error page
  // instead of a raw redirect failure.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
