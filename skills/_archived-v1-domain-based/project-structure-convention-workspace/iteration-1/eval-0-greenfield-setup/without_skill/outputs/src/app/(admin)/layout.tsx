import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/roles";

// 운영자(관리자)만 접근 가능한 레이아웃입니다.
// 1) 로그인 여부 확인 2) role(권한) 확인의 두 단계를 거칩니다.
// 권한 정보는 profiles 테이블이나 Supabase의 custom claims 등에서 가져온다고 가정합니다.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hasAdminAccess = await isAdmin(user.id);

  if (!hasAdminAccess) {
    // 권한이 없는 로그인 사용자는 대시보드로 돌려보냅니다.
    redirect("/dashboard");
  }

  return (
    <div>
      {/* <AdminSidebar /> 같은 관리자 전용 네비게이션을 여기에 둘 수 있습니다. */}
      <main>{children}</main>
    </div>
  );
}
