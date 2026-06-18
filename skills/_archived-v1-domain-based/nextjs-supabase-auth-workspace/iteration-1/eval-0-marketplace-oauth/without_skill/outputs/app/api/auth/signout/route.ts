import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST-only signout endpoint for clients that prefer hitting an API route
 * over calling the signOut() server action directly (e.g. a fetch() call
 * from a client component dropdown menu). Prefer the server action
 * (lib/actions/auth.ts) for plain <form> sign-out buttons.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));
}
