// <a href="/logout">처럼 단순 링크/네비게이션으로도 로그아웃을 트리거하고 싶을 때를
// 위한 Route Handler. 실제 세션 삭제 로직은 actions.ts의 logout()과 동일하게
// 서버에서 수행한다 — 사이드이펙트가 있는 동작이므로 GET이 아니라 POST로 받는다.
// (프론트엔드에서는 폼이나 버튼의 formAction으로 이 라우트 혹은 Server Action을
// 호출하고, <a> 태그로 직접 링크하지 않는다 — GET 로그아웃은 prefetch나 크롤러가
// 의도치 않게 트리거할 수 있다.)
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/login", request.url))
}
