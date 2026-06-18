// 관리자 메인 페이지 - 운영자(admin role)만 볼 수 있습니다.
// 인증 + 권한 체크는 상위 layout.tsx에서 이미 처리되었습니다.
export default function AdminPage() {
  return (
    <section>
      <h1>관리자 페이지</h1>
      <p>운영자만 접근할 수 있는 페이지입니다.</p>
    </section>
  );
}
