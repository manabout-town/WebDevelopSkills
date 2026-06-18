"use server";

// 대시보드 페이지 전용 Server Action 예시.
// 이 라우트에서만 쓰는 동안은 여기 둔다. 다른 라우트에서도 똑같은 로직이
// 실제로 필요해지는 시점에만 lib/actions/로 끌어올린다.

export async function refreshDashboardData() {
  // TODO: lib/supabase/server.ts의 서버 클라이언트로 데이터 조회
  // 미들웨어를 우회해 이 액션을 직접 호출하는 경로가 항상 존재하므로,
  // 여기서도 현재 사용자의 인증 상태를 다시 확인한다.
}
