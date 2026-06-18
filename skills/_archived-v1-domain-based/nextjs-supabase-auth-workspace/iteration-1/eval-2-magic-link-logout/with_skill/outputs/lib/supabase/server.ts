// 서버 컴포넌트 / Server Action에서 사용하는 Supabase 클라이언트.
// 로그인한 사용자 본인 권한(anon key + 쿠키 기반 세션)으로 동작하며 RLS가 적용된다.
// 서버 컴포넌트 렌더링 중에는 쿠키를 새로 쓸 수 없으므로 setAll은 비워둔다 —
// 만료된 토큰 갱신은 middleware.ts가 전담한다. (Server Action에서는 실제로 쿠키 쓰기가
// 가능하지만, 이 클라이언트를 공유해서 쓰기 때문에 동작은 동일하게 둔다. 로그아웃처럼
// 명시적으로 쿠키를 지워야 하는 액션은 supabase.auth.signOut()이 내부적으로
// 쿠키 삭제를 시도하며, Next.js의 쿠키 mutation은 Server Action/Route Handler 안에서만
// 허용되므로 문제가 되지 않는다.)
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
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출된 경우 쿠키를 쓸 수 없어 여기로 떨어진다.
            // 무시해도 안전하다 — 미들웨어가 세션 갱신 쿠키를 책임진다.
          }
        },
      },
    }
  )
}
