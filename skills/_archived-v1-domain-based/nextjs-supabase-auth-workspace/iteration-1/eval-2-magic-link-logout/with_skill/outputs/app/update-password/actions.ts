"use server"
// 새 비밀번호 저장. 이 액션이 호출되는 시점에는 이미 /auth/callback에서 code exchange가
// 끝나 "recovery" 세션이 쿠키에 들어 있는 상태다 — updateUser({ password })는 그
// 세션을 그대로 사용해 비밀번호를 바꾼다.
//
// 중요: recovery 세션도 일반 로그인 세션과 동일한 모양의 쿠키를 만든다. 즉 사용자가
// 비밀번호를 바꾸지 않고 이 페이지를 벗어나면 "로그인된 상태"로 다른 페이지를 돌아다닐
// 수 있다는 뜻이다. 이건 Supabase의 의도된 동작이지만(재설정 흐름 자체가 로그인을
// 겸한다), 보안에 민감한 서비스라면 비밀번호 변경 완료 후 한 번 더 signOut() 후
// 재로그인을 요구하는 정책을 추가로 둘 수 있다. 여기서는 변경 후 로그인 상태를
// 유지하고 홈으로 보내는 일반적인 패턴을 따른다.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type ActionResult = { error: string } | { success: true }

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  const password = formData.get("password") as string
  const passwordConfirm = formData.get("passwordConfirm") as string

  if (!password || password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." }
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않습니다." }
  }

  const supabase = await createClient()

  // recovery 세션 자체가 없으면(= 사용자가 메일 링크 없이 직접 URL로 들어온 경우)
  // updateUser는 "Auth session missing" 류의 에러를 반환한다 — 그대로 사용자에게
  // 안내하고 재설정을 다시 요청하도록 한다.
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: "비밀번호 변경에 실패했습니다. 재설정 링크를 다시 요청해 주세요." }
  }

  redirect("/")
}
