"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action for logout. Prefer wiring this to a <form action={signOut}>
 * (POST) rather than a plain <Link href="/logout"> GET navigation -
 * logging out is a state-changing operation and should never happen via
 * a simple GET link (prefetching, crawlers, etc. could trigger it).
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
