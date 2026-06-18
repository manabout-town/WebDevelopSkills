"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | void;

/**
 * Step 2 of password reset: the user arrived here via the emailed link
 * (which the /auth/callback route already exchanged for a *temporary*
 * recovery session). We now set a new password on that session.
 */
export async function updatePassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== confirmPassword) {
    return { error: "비밀번호가 일치하지 않습니다." };
  }

  const supabase = await createClient();

  // Require an authenticated (recovery) session - if the user navigated
  // here directly without a valid link, this will fail.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "세션이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "비밀번호 변경에 실패했습니다. 다시 시도해주세요." };
  }

  redirect("/login?reset=success");
}
