// app/signup/page.tsx
// Signup only collects email + password (or Google). No role picker here —
// role selection happens in /onboarding right after the account exists.
import { signUpWithPassword, signUpWithGoogle } from "./actions"

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main style={{ maxWidth: 360, margin: "64px auto" }}>
      <h1>회원가입</h1>

      {searchParams.error === "oauth-init-failed" && (
        <p role="alert">Google 회원가입을 시작하지 못했습니다.</p>
      )}

      <form action={signUpWithPassword}>
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
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit">가입하기</button>
      </form>

      <form action={signUpWithGoogle}>
        <button type="submit">Google로 가입하기</button>
      </form>

      <p>
        이미 계정이 있으신가요? <a href="/login">로그인</a>
      </p>
    </main>
  )
}
