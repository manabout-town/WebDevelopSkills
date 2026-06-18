import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// RLS를 우회하는 service_role 키를 쓰는 클라이언트.
// 서버 전용 코드(Server Action, 라우트 핸들러, 백그라운드 작업)에서만 import한다.
// 절대 클라이언트 컴포넌트나 공개 응답에 노출하지 않는다.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
