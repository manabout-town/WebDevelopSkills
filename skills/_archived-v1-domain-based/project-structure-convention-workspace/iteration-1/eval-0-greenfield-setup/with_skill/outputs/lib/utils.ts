// 여러 라우트/컴포넌트에서 공통으로 쓰는 순수 함수.
// 특정 라우트에서만 쓰는 헬퍼는 여기 두지 말고 해당 라우트 폴더 안에 둔다.

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ko-KR");
}
