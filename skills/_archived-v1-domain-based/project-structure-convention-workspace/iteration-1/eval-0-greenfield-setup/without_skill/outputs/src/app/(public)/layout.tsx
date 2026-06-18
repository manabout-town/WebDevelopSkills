// 비로그인 사용자도 접근 가능한 공개 레이아웃입니다.
// 인증 체크를 하지 않습니다. 헤더/푸터 등 공용 UI만 둡니다.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <SiteHeader /> 같은 공용 네비게이션을 여기에 둘 수 있습니다. */}
      <main>{children}</main>
    </div>
  );
}
