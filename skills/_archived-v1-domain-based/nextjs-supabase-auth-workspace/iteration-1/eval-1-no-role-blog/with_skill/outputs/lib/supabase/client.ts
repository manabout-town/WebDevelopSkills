// 브라우저("use client" 컴포넌트)에서 사용하는 Supabase 클라이언트.
// anon key + RLS가 적용된 상태로 동작하므로, 여기서 호출하는 모든 쿼리는
// RLS 정책을 통과해도 안전한 것이어야 한다.
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
