"use server"
// 로그아웃은 클라이언트에서 supabase.auth.signOut()만 호출하고 끝내는 경우가 흔한데,
// 그러면 서버 컴포넌트가 읽는 쿠키가 즉시 정리되지 않거나 다른 탭에 반영이 늦어질 수
// 있다. Server Action으로 서버에서 직접 세션 쿠키를 지우는 것이 가장 확실하다.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
