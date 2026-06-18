// 미들웨어 전용 Supabase 클라이언트.
// 매 요청마다 만료된 access token을 갱신할 수 있는 유일한 위치라서, 갱신된 쿠키를
// request와 response 양쪽에 모두 써야 한다 — 그래야 (1) 같은 요청 안에서 이어지는
// 서버 컴포넌트가 새 쿠키를 읽고 (2) 브라우저도 응답으로 새 쿠키를 받는다.
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export function createClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // 1) 갱신된 쿠키를 request에 반영 — 같은 요청 파이프라인의 다음 단계가 읽는다.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // 2) request가 갱신됐으니 response를 다시 만들어 그 위에 쌓는다.
          response = NextResponse.next({ request })
          // 3) 실제 Set-Cookie 헤더는 response에 써야 브라우저에 전달된다.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}
