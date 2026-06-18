// 로그인/로그아웃 Server Action.
// 역할이 없으므로 로그인 성공 후 분기할 대상 대시보드가 없다 — 항상 홈(또는
// 원래 가려던 페이지)으로 보낸다.
"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/"

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // 이메일 확인이 켜져 있다면 세션이 바로 생기지 않을 수 있다 — 안내 페이지로 보낸다.
  redirect("/login?message=확인 이메일을 보냈습니다. 메일을 확인해주세요.")
}

// 로그아웃은 클라이언트에서 signOut()만 호출하고 끝내지 않는다 —
// 서버에서 직접 세션 쿠키를 지워야 다른 탭/서버 컴포넌트에도 즉시 반영된다.
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
