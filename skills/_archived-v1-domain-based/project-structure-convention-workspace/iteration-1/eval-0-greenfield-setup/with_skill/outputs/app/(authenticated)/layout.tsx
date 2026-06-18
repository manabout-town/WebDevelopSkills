import type { ReactNode } from "react";

// (authenticated) 그룹: 로그인이 필요하지만 특정 역할은 요구하지 않음.
// 사이드바가 있는 대시보드 셸 등 로그인 사용자 공통 UI를 여기에 둔다.
// 실제 인증 검사는 middleware에서 이 그룹 경로를 보호하는 방식으로 처리한다
// (nextjs-supabase-auth 스킬의 미들웨어 매처 참고).
export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* TODO: <DashboardSidebar /> */}
      <main>{children}</main>
    </div>
  );
}
