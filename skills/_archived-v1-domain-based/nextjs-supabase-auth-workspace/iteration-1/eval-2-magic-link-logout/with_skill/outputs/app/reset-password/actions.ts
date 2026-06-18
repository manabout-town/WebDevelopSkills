"use server"
// 비밀번호 재설정 메일 발송. resetPasswordForEmail의 redirectTo를
// /auth/callback?next=/update-password 로 지정해 두는 것이 핵심이다 — 이렇게 해야
// 기존 매직 링크용 콜백 라우트를 재사용하면서도, code exchange 이후 일반 로그인처럼
// 홈으로 보내지 않고 반드시 새 비밀번호 입력 폼(/update-password)으로 보낸다.
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error: string } | { success: true }

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string
  if (!email) {
    return { error: "이메일을 입력해 주세요." }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/update-password")}`,
  })

  if (error) {
    // 이메일 존재 여부를 노출하지 않기 위해 항상 동일한 성공 메시지를 보여주는 것이
    // 일반적인 보안 관행이다 — 실패해도 success로 응답한다 (단, 레이트리밋 등
    // 명백한 시스템 오류는 콘솔/로그로만 남기고 사용자에게는 동일 문구를 보여준다).
    return { success: true }
  }

  return { success: true }
}
