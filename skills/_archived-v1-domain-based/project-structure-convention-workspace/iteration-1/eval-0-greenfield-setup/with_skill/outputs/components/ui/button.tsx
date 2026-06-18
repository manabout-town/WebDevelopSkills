import type { ButtonHTMLAttributes } from "react";

// 디자인 시스템 프리미티브 예시. 도메인 로직이 없는 순수 UI이므로
// "공유될지 안 될지" 판단할 필요 없이 처음부터 components/ui/에 둔다.
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
