// 브라우저(Client Component)에서 사용하는 Supabase 클라이언트.
// anon key로 동작하며 RLS가 항상 적용된다 — 여기서 호출하는 쿼리는 RLS를 통과해야 안전하다.
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
