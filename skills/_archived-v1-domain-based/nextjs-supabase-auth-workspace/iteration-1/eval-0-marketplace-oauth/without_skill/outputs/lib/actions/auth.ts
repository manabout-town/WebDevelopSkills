"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = { error: string } | never;

/**
 * Email + password signup. Supabase sends a confirmation email by default;
 * if "Confirm email" is disabled in the Supabase dashboard, the user will
 * already have a session immediately after this call.
 *
 * A profiles row is created automatically by the `handle_new_user` DB
 * trigger (see supabase/migrations/0001_profiles_and_roles.sql) — no role
 * yet, so the user lands on /onboarding/role next.
 */
export async function signUpWithEmail(
  _prevState: unknown,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Email confirmation required and no session yet -> tell the user to
  // check their inbox instead of redirecting into the app.
  if (!data.session) {
    redirect("/signup?check-email=1");
  }

  redirect("/onboarding/role");
}

export async function signInWithEmail(
  _prevState: unknown,
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  revalidatePath("/", "layout");
  redirect(profile?.role ? `/dashboard/${profile.role}` : "/onboarding/role");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Sets the user's role exactly once during onboarding. Blocked server-side
 * (in addition to the DB trigger `lock_role_after_set`) so we can return a
 * friendly error instead of a raw Postgres exception.
 */
export async function setUserRole(
  _prevState: unknown,
  formData: FormData
): Promise<AuthActionResult> {
  const role = String(formData.get("role") ?? "");

  if (role !== "buyer" && role !== "seller") {
    return { error: "구매자 또는 판매자를 선택해 주세요." };
  }

  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (existing?.role) {
    // Already onboarded — just send them to their existing dashboard.
    redirect(`/dashboard/${existing.role}`);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userRes.user.id);

  if (error) {
    return { error: "역할을 저장하지 못했습니다. 다시 시도해 주세요." };
  }

  revalidatePath("/", "layout");
  redirect(`/dashboard/${role}`);
}
