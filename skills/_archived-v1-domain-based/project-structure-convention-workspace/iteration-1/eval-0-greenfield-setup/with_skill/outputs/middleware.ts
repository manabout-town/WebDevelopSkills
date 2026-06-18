import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 프로젝트 루트의 미들웨어 진입점.
// 실제 세션 갱신 / 라우트 보호 로직은 lib/supabase/middleware.ts에 있다.
// matcher가 보호하는 경로와 app/(authenticated), app/(admin) 그룹 경계를
// 일치시켜두면, "이 라우트는 어떤 미들웨어가 보호하는가"를 그룹만 보고 알 수 있다.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
