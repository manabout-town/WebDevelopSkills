import { createBrowserClient } from "@supabase/ssr";

// 클라이언트 컴포넌트("use client")에서 사용하는 Supabase 클라이언트입니다.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
