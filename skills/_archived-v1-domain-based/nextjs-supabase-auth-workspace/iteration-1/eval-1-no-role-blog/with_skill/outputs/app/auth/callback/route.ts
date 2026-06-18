// 매직 링크 / OAuth 로그인을 쓴다면 Supabase가 임시 code를 붙여 이 라우트로
// 리다이렉트시킨다. 이 code를 실제 세션으로 교환하는 라우트가 없으면
// "로그인 버튼은 동작하는데 로그인이 안 되어 있다"는 현상이 생긴다.
//
// 이메일+비밀번호만 쓸 계획이라면 이 라우트는 당장 필요 없지만,
// 나중에 매직 링크/구글 로그인을 추가할 가능성을 고려해 미리 둔다.
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
