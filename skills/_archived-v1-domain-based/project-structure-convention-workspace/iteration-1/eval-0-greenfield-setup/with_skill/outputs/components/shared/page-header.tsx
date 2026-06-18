import type { ReactNode } from "react";

// 2개 이상의 라우트에서 쓰는 기능성 컴포넌트 예시.
// 처음부터 여기 만들지 않는다 — 한 라우트에서 쓰다가 두 번째 라우트에서
// 실제로 똑같은 게 필요해지는 시점에 라우트 폴더에서 이곳으로 옮긴다.
export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
