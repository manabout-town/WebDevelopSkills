// 프로젝트 루트의 미들웨어.
// 역할이 없는 앱이므로 "로그인했는가, 안 했는가"만 검사한다.
// 보호 대상: 글쓰기 페이지(/write)와 그 하위 경로(예: /write/[id]/edit).
// 나머지 페이지는 전부 공개로 둔다.
//
// 주의: 미들웨어는 1차 방어선일 뿐이다. 진짜 보안 경계는 DB의 RLS 정책이어야 한다.
// (posts 테이블에 "본인 글만 수정 가능" 같은 정책이 별도로 있어야 한다.)
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

// 로그인 없이 접근 가능한 경로.
// "/write"는 여기 포함하지 않는다 — 보호 대상이기 때문.
const PUBLIC_PATHS = ["/", "/login", "/signup"]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith("/auth/")) return true // OAuth/매직링크 콜백
  if (pathname.startsWith("/posts/")) return true // 글 상세/목록은 공개 블로그
  return false
}

function isProtectedPath(pathname: string) {
  // /write, /write/new, /write/[id]/edit 등 글쓰기 관련 경로만 보호한다.
  return pathname === "/write" || pathname.startsWith("/write/")
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // getUser()는 Supabase Auth 서버에 토큰을 검증하는 요청이라 getSession()보다 느리지만,
  // 위조된 쿠키를 신뢰하지 않으므로 미들웨어의 인증 체크에는 이걸 써야 한다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url)
    // 로그인 후 원래 가려던 글쓰기 페이지로 돌려보내기 위한 redirect 파라미터
    loginUrl.searchParams.set("redirectTo", pathname)
    // 갱신된 쿠키(response.headers)를 리다이렉트 응답에도 그대로 옮긴다.
    return NextResponse.redirect(loginUrl, { headers: response.headers })
  }

  // 이미 로그인한 사용자가 /login, /signup에 다시 들어오면 홈으로 보낸다.
  // (역할이 없으므로 분기할 대상 대시보드가 따로 없다 — 그냥 홈으로.)
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url), { headers: response.headers })
  }

  // 그 외의 모든 경우: 갱신된 쿠키가 담긴 response를 반드시 그대로 반환한다.
  // 여기서 새 NextResponse.next()를 만들면 토큰 갱신 쿠키가 사라진다.
  return response
}

export const config = {
  matcher: [
    /*
     * 정적 파일/이미지 최적화 요청은 제외하고 나머지 모든 경로에 적용.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
