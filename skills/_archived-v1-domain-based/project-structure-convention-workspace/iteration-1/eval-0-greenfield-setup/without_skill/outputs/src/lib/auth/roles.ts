import { createSupabaseServerClient } from "@/lib/supabase/server";

// 운영자(admin) 권한 여부를 확인하는 헬퍼입니다.
// 실제 구현에서는 profiles 테이블의 role 컬럼이나
// Supabase custom claims, 별도의 admin_users 테이블 등을 조회하세요.
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === "admin";
}
