// app/login/page.tsx
// Minimal login screen: email+password form plus a "Continue with Google"
// button. Both call into Server Actions (app/login/actions.ts) so the
// session cookie is always set/cleared on the server.
import { loginWithPassword, loginWithGoogle } from "./actions"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string }
}) {
  return (
    <main style={{ maxWidth: 360, margin: "64px auto" }}>
      <h1>로그인</h1>

      {searchParams.error === "auth-callback-failed" && (
        <p role="alert">로그인 처리에 실패했습니다. 다시 시도해주세요.</p>
      )}
      {searchParams.error === "oauth-init-failed" && (
        <p role="alert">Google 로그인을 시작하지 못했습니다.</p>
      )}

      <form action={loginWithPassword}>
        <input type="hidden" name="next" value={searchParams.next ?? ""} />
        <label>
          이메일
          <input type="email" name="email" required autoComplete="email" />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit">로그인</button>
      </form>

      <form action={loginWithGoogle}>
        <button type="submit">Google로 계속하기</button>
      </form>

      <p>
        계정이 없으신가요? <a href="/signup">회원가입</a>
      </p>
    </main>
  )
}
