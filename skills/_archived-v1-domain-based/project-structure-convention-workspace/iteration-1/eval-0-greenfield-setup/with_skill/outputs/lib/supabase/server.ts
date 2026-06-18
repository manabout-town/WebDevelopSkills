import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트 / Server Action / 라우트 핸들러에서 사용하는 Supabase 클라이언트.
// 쿠키 기반으로 현재 요청의 세션을 읽고 쓴다.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // TODO: Server Component에서 호출 시 발생하는 쓰기 에러는 무시 가능
          // (미들웨어가 세션 갱신을 담당하므로).
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서는 set 불가 — 미들웨어가 처리.
          }
        },
      },
    }
  );
}
