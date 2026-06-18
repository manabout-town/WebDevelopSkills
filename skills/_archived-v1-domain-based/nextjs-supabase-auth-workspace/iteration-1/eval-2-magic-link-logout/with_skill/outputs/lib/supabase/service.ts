// service_role key를 사용하는 클라이언트 — RLS를 완전히 우회한다.
// 절대 클라이언트 컴포넌트/미들웨어에서 import하지 말 것. 서버 전용 코드
// (Server Action, Route Handler)에서만, "사용자 권한으로는 할 수 없는 작업"이라는
// 명확한 이유가 있을 때만 사용한다. 이 파일을 import하는 곳마다 주석으로 이유를 남긴다.
import { createClient as createServiceClient } from "@supabase/supabase-js"

export function createClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // NEXT_PUBLIC_ 접두사 절대 금지
  )
}
