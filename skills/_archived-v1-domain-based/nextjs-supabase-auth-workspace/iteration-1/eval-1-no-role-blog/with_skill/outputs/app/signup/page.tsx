// 회원가입 페이지. 역할이 없으므로 가입 즉시 완료 — 온보딩/역할 선택 단계가 없다.
import { signup } from "@/lib/actions/auth"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">회원가입</h1>

      {params.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <form action={signup} className="space-y-4">
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
            minLength={6}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black px-3 py-2 text-white"
        >
          가입하기
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        이미 계정이 있으신가요? <a href="/login" className="underline">로그인</a>
      </p>
    </main>
  )
}
