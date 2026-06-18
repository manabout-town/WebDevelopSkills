// 글 작성 Server Action.
// 미들웨어가 /write를 막아주긴 하지만, 미들웨어는 matcher 설정 실수나 캐싱 등으로
// 우회될 수 있는 경우가 있으므로 Server Action 안에서도 로그인 여부를 한 번 더 확인한다.
// (역할이 없으므로 여기서는 "로그인했는가"만 재검증하면 충분 — role 체크는 불필요.)
"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // 서버 측 재검증 실패 — 미들웨어를 어떻게든 우회했더라도 여기서 막힌다.
    redirect("/login?redirectTo=/write")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string

  if (!title?.trim() || !content?.trim()) {
    redirect("/write?error=제목과 내용을 입력해주세요")
  }

  // author_id를 명시적으로 현재 사용자로 지정한다.
  // posts 테이블의 RLS insert 정책이 "auth.uid() = author_id"를 요구하므로,
  // 다른 사람의 id를 넣으려고 하면 RLS가 막아준다 (이중 방어).
  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, author_id: user.id })
    .select("id")
    .single()

  if (error) {
    redirect(`/write?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/posts")
  redirect(`/posts/${data.id}`)
}
