// 로그인/회원가입 등 인증 관련 페이지의 레이아웃입니다.
// 이미 로그인한 사용자가 다시 로그인 페이지에 들어오면
// 대시보드로 리다이렉트하는 로직을 여기서 처리할 수 있습니다.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      {children}
    </div>
  );
}
