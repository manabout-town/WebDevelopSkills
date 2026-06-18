import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 로그인한 사용자만 접근 가능한 레이아웃입니다.
// 세션이 없으면 로그인 페이지로 리다이렉트합니다.
// (middleware.ts에서도 동일하게 보호하지만, 레이아웃에서도 한 번 더 확인하는
//  defense-in-depth 패턴을 권장합니다.)
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      {/* <DashboardSidebar /> 같은 대시보드 전용 네비게이션을 여기에 둘 수 있습니다. */}
      <main>{children}</main>
    </div>
  );
}
