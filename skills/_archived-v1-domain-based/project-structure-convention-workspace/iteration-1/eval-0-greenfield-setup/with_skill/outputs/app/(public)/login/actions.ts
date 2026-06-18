"use server";

// 로그인 페이지 전용 Server Action.
// 이 액션을 호출하는 페이지가 같은 폴더에 있으므로 "어디서 쓰이는지" 찾을 필요가 없다.
// 두 번째 라우트에서 동일한 로직이 실제로 필요해지기 전까지는 lib/actions/로 옮기지 않는다.

export async function signIn(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // TODO: lib/supabase/server.ts의 클라이언트로 supabase.auth.signInWithPassword 호출
  // 미들웨어가 이 라우트를 보호하지 않더라도, 액션 자체에서 별도로 검증/처리한다.
}
