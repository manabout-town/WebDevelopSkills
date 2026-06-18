import type { ReactNode } from "react";

// 루트 레이아웃: 모든 라우트 그룹의 공통 뼈대 (html/body, 전역 provider, 전역 CSS).
// 그룹별 UI(헤더/푸터, 사이드바 등)는 각 라우트 그룹의 layout.tsx에서 처리한다.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
