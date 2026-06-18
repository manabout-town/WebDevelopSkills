// 서버 컴포넌트 / Server Action에서 사용하는 Supabase 클라이언트.
// 로그인한 사용자 본인 권한(anon key + 쿠키 기반 세션)으로 동작하며 RLS가 적용된다.
// 서버 컴포넌트 렌더링 중에는 쿠키를 새로 쓸 수 없으므로 setAll은 비워둔다 —
// 만료된 토큰 갱신은 middleware.ts가 전담한다.
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 세션 갱신은 미들웨어가 담당.
        },
      },
    }
  )
}
