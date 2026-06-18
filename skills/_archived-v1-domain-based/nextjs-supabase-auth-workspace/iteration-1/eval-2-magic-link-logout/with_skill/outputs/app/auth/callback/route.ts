// 매직 링크 & 비밀번호 재설정 메일의 공통 콜백.
// Supabase가 이메일 링크에 ?code=... 를 붙여 이 라우트로 리다이렉트시키면,
// 그 code를 실제 세션으로 교환한다. 이 라우트가 없으면 "링크는 누르는데 로그인이
// 안 되어 있다"는 현상이 그대로 발생한다.
//
// 매직 링크와 비밀번호 재설정은 둘 다 code exchange 흐름을 타지만 의미가 다르다:
// - 매직 링크: 교환 후 일반 로그인 세션 → 원래 가려던 곳(next)으로 보내면 된다.
// - 비밀번호 재설정: 교환 후 세션은 생기지만 "recovery" 타입이다. 이걸 일반 로그인으로
//   오해해서 바로 대시보드로 보내면 안 된다 — 반드시 /update-password로 보내서
//   새 비밀번호를 입력받아야 한다.
//
// 두 경우를 구분하는 방법: resetPasswordForEmail을 호출할 때 redirectTo에
// /auth/callback?next=/update-password 를 지정해 둔다 (login 페이지의 매직 링크
// 요청은 next=/ 또는 원래 가려던 경로를 쓴다). 그래서 여기서는 별도의 분기 로직 없이
// "교환 후 어디로 보낼지"를 호출 시점에 정해진 next 파라미터에 그대로 위임한다.
// (참고: exchangeCodeForSession이 반환하는 session.user에는 recovery 여부가 직접
// 노출되지 않으므로, type 자체는 next 경로로 구분하는 것이 가장 안전하고 명확하다.)
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
      // next는 항상 우리 서버가 redirectTo에 직접 박아넣은 값이므로 신뢰할 수 있지만,
      // 방어적으로 같은 origin 내부 경로인지 한 번 더 확인한다 (open redirect 방지).
      const safeNext = next.startsWith("/") ? next : "/"
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // code가 없거나 교환에 실패한 경우 — 만료된 링크, 이미 사용된 링크 등.
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
