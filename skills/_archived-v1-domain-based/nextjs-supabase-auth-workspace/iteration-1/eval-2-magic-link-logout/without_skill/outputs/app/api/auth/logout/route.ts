import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST-only logout endpoint for cases where a Server Action isn't a good
 * fit (e.g. logging out from a client-side dropdown via fetch(), or from
 * a non-form UI element). Mirrors app/logout/actions.ts.
 *
 * Intentionally no GET handler: logout must never be triggerable by a
 * plain link/navigation or link-prefetching.
 */
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
