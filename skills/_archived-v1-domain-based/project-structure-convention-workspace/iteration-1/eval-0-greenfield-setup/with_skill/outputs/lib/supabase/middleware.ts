import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// middleware.ts(프로젝트 루트)에서 호출되는 세션 갱신 + 라우트 보호 헬퍼.
// 라우트 그룹((public)/(authenticated)/(admin)) 경계와 여기서의 보호 로직이
// 일치해야, 어떤 매처가 어떤 라우트를 보호하는지 그룹만 보고 알 수 있다.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TODO: (authenticated), (admin) 그룹 경로에 대해 user 존재 여부 /
  // 역할(admin)을 확인하고, 없으면 로그인 페이지로 redirect.

  return response;
}
