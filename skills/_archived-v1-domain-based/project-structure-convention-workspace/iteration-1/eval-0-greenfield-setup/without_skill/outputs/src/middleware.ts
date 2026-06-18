import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 모든 요청에서 Supabase 세션을 갱신하고,
// 보호된 경로(/dashboard, /admin)에 비로그인 사용자가 접근하면 리다이렉트합니다.
// 세밀한 권한(관리자 여부) 체크는 각 라우트 그룹의 layout.tsx에서 처리합니다.
export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청 경로에 미들웨어를 적용합니다:
     * - _next/static, _next/image (정적 파일)
     * - favicon.ico
     * - 이미지 파일 확장자
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
