/**
 * Shared helper that creates a Supabase client bound to the request/response
 * pair inside middleware, and refreshes the auth session.
 *
 * Next.js middleware runs on the Edge runtime on every matched request, so
 * this is the right place to:
 *  1. Refresh an expiring session (keeps the user logged in).
 *  2. Read the current user to decide whether to allow/redirect the request.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // This response will carry forward any refreshed auth cookies.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Write to both the request (so this same middleware invocation
          // sees the updated cookie) and the response (so the browser does).
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // IMPORTANT: do not run any code between createServerClient and this call.
  // getUser() validates the session against Supabase Auth (not just reading
  // the cookie), which is what makes this check trustworthy.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
