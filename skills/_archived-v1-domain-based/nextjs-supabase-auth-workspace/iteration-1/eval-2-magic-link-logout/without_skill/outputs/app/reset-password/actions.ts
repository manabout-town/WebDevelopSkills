"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { success: string } | void;

/**
 * Step 1 of password reset: send the reset email. Always returns a
 * generic success message regardless of whether the email exists, to
 * avoid leaking account existence (Supabase itself behaves this way by
 * default, but we keep the UI copy generic too).
 */
export async function requestPasswordReset(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "이메일을 입력해주세요." };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Lands on the shared callback, then forwards to /update-password
    // where the user actually sets a new password.
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    // Log server-side for ops visibility, but don't reveal details to the client.
    console.error("resetPasswordForEmail error:", error.message);
  }

  return {
    success:
      "입력하신 이메일이 가입되어 있다면, 비밀번호 재설정 링크를 보내드렸습니다.",
  };
}
