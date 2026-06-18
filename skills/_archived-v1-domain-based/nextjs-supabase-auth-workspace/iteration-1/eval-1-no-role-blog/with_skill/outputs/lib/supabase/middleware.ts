// 미들웨어 전용 Supabase 클라이언트.
// 미들웨어는 매 요청마다 만료된 access token을 갱신할 수 있는 유일한 위치다.
// 갱신된 쿠키를 request와 response 양쪽에 모두 반영해야
// 브라우저와 다음 단계(서버 컴포넌트) 양쪽에서 새 세션이 보인다.
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // 갱신된 request 쿠키를 반영해 response를 다시 만든다.
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}
