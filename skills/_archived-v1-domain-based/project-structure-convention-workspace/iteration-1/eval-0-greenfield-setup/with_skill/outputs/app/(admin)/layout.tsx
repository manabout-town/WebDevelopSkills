import type { ReactNode } from "react";

// (admin) 그룹: 운영자/관리자만 접근. 일반 (authenticated) 사용자와는
// 별도의 레이아웃(관리자용 네비게이션 등)을 둔다.
// 인증 + "관리자 역할" 여부 모두 middleware 및 액션 단에서 확인한다.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* TODO: <AdminNav /> */}
      <main>{children}</main>
    </div>
  );
}
