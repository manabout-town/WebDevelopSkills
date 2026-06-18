// 로그인 페이지. 역할이 없으므로 로그인 후 분기 로직이 없다 —
// 단순히 원래 가려던 경로(redirectTo)나 홈으로 돌려보낸다.
import { login } from "@/lib/actions/auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; message?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirectTo ?? "/"

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">로그인</h1>

      {params.message && (
        <p className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {params.message}
        </p>
      )}
      {params.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <form action={login} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black px-3 py-2 text-white"
        >
          로그인
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        계정이 없으신가요? <a href="/signup" className="underline">회원가입</a>
      </p>
    </main>
  )
}
