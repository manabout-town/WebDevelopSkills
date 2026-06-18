"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 서버 액션 패턴 예시: 폼 제출 -> Supabase 인증 -> 리다이렉트
export async function login(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 실제 구현에서는 에러 상태를 반환해 폼에 표시하세요.
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}
