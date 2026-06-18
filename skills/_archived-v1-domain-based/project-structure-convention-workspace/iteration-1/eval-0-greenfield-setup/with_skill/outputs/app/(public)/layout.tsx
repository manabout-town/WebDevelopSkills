import type { ReactNode } from "react";

// (public) 그룹: 로그인 여부와 관계없이 누구나 접근 가능.
// 마케팅용 헤더/푸터 등 공개 페이지 공통 셸을 여기에 둔다.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* TODO: <PublicHeader /> */}
      <main>{children}</main>
      {/* TODO: <PublicFooter /> */}
    </div>
  );
}
