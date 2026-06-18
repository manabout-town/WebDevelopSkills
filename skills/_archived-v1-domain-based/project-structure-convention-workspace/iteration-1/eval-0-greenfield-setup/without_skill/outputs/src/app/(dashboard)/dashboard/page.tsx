// 대시보드 메인 페이지 - 로그인한 사용자만 볼 수 있습니다.
// 인증 체크는 상위 layout.tsx에서 이미 처리되었습니다.
export default function DashboardPage() {
  return (
    <section>
      <h1>대시보드</h1>
      <p>로그인한 사용자만 볼 수 있는 페이지입니다.</p>
    </section>
  );
}
