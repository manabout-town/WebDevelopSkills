// 헤더 — 로그인 여부에 따라 "글쓰기/로그아웃" 또는 "로그인" 버튼만 분기한다.
// 역할이 없으므로 이 외의 분기는 없다.
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"

export default async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <Link href="/" className="font-semibold">
        내 블로그
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <Link href="/write">글쓰기</Link>
            <form action={logout}>
              <button type="submit" className="text-gray-500 underline">
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </nav>
    </header>
  )
}
