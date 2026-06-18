// 비밀번호 재설정 메일 링크를 클릭한 뒤 도착하는 페이지 — 여기서 처음으로 새
// 비밀번호를 입력받는다.
//
// 세션 종류 구분: /auth/callback이 code를 교환하면 Supabase는 "recovery" 타입의
// 세션을 만든다. 이 페이지는 그 세션이 일반 로그인이 아니라는 걸 활용해 "비밀번호를
// 입력하기 전까지는 다른 보호된 페이지로 보내지 않는다"는 의미로 존재한다.
// 미들웨어의 PUBLIC_PATHS에 /update-password를 넣어둔 이유도 이것이다 — user가
// 있어도(recovery 세션이라도) 이 경로 자체는 막지 않고 페이지에 도달시킨 다음,
// 여기서 세션 유효성을 한 번 더 확인한다.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UpdatePasswordForm } from "./UpdatePasswordForm"

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // recovery 세션이 전혀 없는 상태로 직접 이 URL에 들어온 경우 — 재설정 메일을
  // 다시 요청하도록 안내한다. (콜백 실패 시 /login?error=... 로 이미 빠지지만,
  // 만료된 세션으로 새로고침한 경우 등을 한 번 더 방어한다.)
  if (!user) {
    redirect("/reset-password")
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-xl font-semibold">새 비밀번호 설정</h1>
      <UpdatePasswordForm />
    </div>
  )
}
