"use server"
// 로그인 페이지의 Server Action들.
// 기존 이메일/비밀번호 로그인(signInWithPassword)은 그대로 두고, 매직 링크
// 로그인(signInWithOtp)을 새 액션으로 추가한다. 비밀번호 로그인은 호출 즉시 세션이
// 생기므로 콜백이 필요 없지만, 매직 링크는 이메일 전송 후 사용자가 링크를 눌러야
// /auth/callback에서 세션이 만들어진다 — 그래서 이 액션은 "메일 전송 성공/실패"만
// 반환하고, 실제 로그인 완료는 콜백 라우트의 책임이다.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error: string } | { success: true }

export async function loginWithPassword(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const next = (formData.get("next") as string) || "/"

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
  }

  redirect(next.startsWith("/") ? next : "/")
}

export async function loginWithMagicLink(formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string
  const next = (formData.get("next") as string) || "/"

  if (!email) {
    return { error: "이메일을 입력해 주세요." }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // 콜백에서 교환 후 보낼 곳. 일반 매직 링크 로그인이므로 next를 그대로 전달한다
      // (회원가입 여부에 따라 새 계정을 만들 수도 있다 — shouldCreateUser 기본값은 true).
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        next.startsWith("/") ? next : "/"
      )}`,
    },
  })

  if (error) {
    return { error: "매직 링크 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." }
  }

  return { success: true }
}
