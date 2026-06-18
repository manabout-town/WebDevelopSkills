import { NextResponse } from "next/server";

// OAuth / 이메일 매직링크 등 Supabase 인증 콜백을 처리하는 라우트 핸들러.
// app/ 바로 아래 위치 — 라우트 그룹(접근 권한)과 무관한 인프라성 엔드포인트이기 때문.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // TODO: lib/supabase/server.ts의 클라이언트로 exchangeCodeForSession(code) 호출
  }

  return NextResponse.redirect(`${origin}${next}`);
}
