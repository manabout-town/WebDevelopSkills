"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { success: string } | void;

/**
 * Existing email/password sign-in flow. Unchanged in behavior, just
 * reviewed for consistency with the new magic-link action below.
 */
export async function signInWithPassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Avoid leaking whether the account exists.
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * New: magic-link (passwordless) sign-in. Sends a one-time login link to
 * the user's email. Supabase will redirect back to /auth/callback with a
 * `code` query param that we exchange for a session.
 */
export async function signInWithMagicLink(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "이메일을 입력해주세요." };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Where Supabase redirects the user after they click the email link.
      emailRedirectTo: `${origin}/auth/callback?next=/`,
      // Do not silently create new accounts via magic link unless that's
      // an intentional product decision. Set to true if you want magic
      // link to double as a signup flow.
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: "매직 링크 전송에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  return { success: "로그인 링크를 이메일로 보내드렸습니다. 메일함을 확인해주세요." };
}
