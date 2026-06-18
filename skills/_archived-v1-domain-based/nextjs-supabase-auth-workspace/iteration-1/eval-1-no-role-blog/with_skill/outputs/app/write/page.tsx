// 글쓰기 페이지 — 미들웨어가 비로그인 사용자를 /login으로 이미 리다이렉트하므로
// 이 컴포넌트에 도달했다는 것은 곧 로그인된 상태라는 뜻이다.
// 그래도 서버 컴포넌트이므로 user 정보가 필요하면 다시 조회해서 화면에 쓸 수 있다.
import { createClient } from "@/lib/supabase/server"
import { createPost } from "@/lib/actions/posts"

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">새 글 쓰기</h1>
      <p className="mb-6 text-sm text-gray-500">{user?.email}로 로그인됨</p>

      {params.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <form action={createPost} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black px-3 py-2 text-white"
        >
          발행하기
        </button>
      </form>
    </main>
  )
}
