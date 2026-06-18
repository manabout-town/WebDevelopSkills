"use server";

// 관리자 대시보드 전용 Server Action 예시.
// 일반 사용자 액션과 분리되어 있으므로, 여기 있는 액션은
// 항상 "현재 사용자가 관리자 역할인가"까지 함께 검증해야 한다.

export async function performAdminTask(formData: FormData) {
  // TODO:
  // 1. lib/supabase/server.ts로 현재 사용자 인증 확인
  // 2. 사용자의 역할이 admin(운영자)인지 재검증 (미들웨어와 별개로 액션에서도 필수)
  // 3. 실제 작업 수행
}
