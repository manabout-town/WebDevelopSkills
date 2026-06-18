// 루트 미들웨어 — 1차 방어선. 로그인하지 않은 사용자가 보호된 페이지에 접근하면
// 즉시 /login으로 리다이렉트한다. 진짜 보안 경계는 DB의 RLS 정책이며 (이미 적용돼
// 있어야 함), 미들웨어는 UX 차원의 빠른 차단일 뿐이라는 점을 잊지 않는다.
//
// 이번 변경(매직 링크/비밀번호 재설정 추가)에서 미들웨어가 챙겨야 할 것:
// 1) /auth/callback, /reset-password, /update-password 를 public 경로에 추가한다.
//    빠뜨리면 "메일의 링크를 눌렀는데 로그인 페이지로 튕긴다" 버그가 난다.
// 2) /update-password는 "로그인은 돼 있지만 일반 로그인이 아니라 recovery 세션"인
//    상태로 들어오므로, user가 있다고 무조건 통과시키는 게 아니라 이 경로 자체를
//    public 목록에 둬서 별도 취급한다 (페이지 자체에서 recovery 여부를 검사한다).
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/middleware"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/reset-password", // 비밀번호 재설정 메일 요청 페이지
  "/update-password", // 메일 링크를 타고 돌아와 새 비밀번호를 입력하는 페이지 (recovery 세션)
]

function isPublicPath(path: string) {
  if (PUBLIC_PATHS.includes(path)) return true
  // 매직 링크/OAuth/비밀번호 재설정 콜백은 전부 /auth/ 아래에 둔다 — 세션이 아직
  // 만들어지기 전에 도달하는 라우트이므로 반드시 public이어야 한다.
  if (path.startsWith("/auth/")) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // getUser()는 매번 Supabase Auth 서버에 토큰을 검증한다 (getSession()과 달리
  // 쿠키만 믿지 않음) — 미들웨어처럼 보안 판단을 하는 곳에서는 항상 getUser()를 쓴다.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublic = isPublicPath(path)

  if (!user && !isPublic) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("next", path)
    // 갱신된 쿠키(response.cookies)를 리다이렉트 응답에도 옮긴다 — 새 NextResponse를
    // 그냥 만들면 토큰 갱신 쿠키가 사라진다.
    return NextResponse.redirect(redirectUrl, { headers: response.headers })
  }

  if (user && (path === "/login" || path === "/signup")) {
    // 이미 로그인된 사용자가 로그인/가입 페이지에 다시 들어오면 홈으로 보낸다.
    return NextResponse.redirect(new URL("/", request.url), { headers: response.headers })
  }

  // 갱신된 쿠키가 담긴 response를 반드시 그대로 반환한다 — 여기서 새
  // NextResponse.next()로 덮어쓰면 "로그인했는데 새로고침하면 풀린다" 버그가 생긴다.
  return response
}

export const config = {
  matcher: [
    /*
     * 정적 자산과 이미지 최적화 경로는 제외한다.
     * 필요하면 프로젝트의 public/ 자산 패턴에 맞게 조정한다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
