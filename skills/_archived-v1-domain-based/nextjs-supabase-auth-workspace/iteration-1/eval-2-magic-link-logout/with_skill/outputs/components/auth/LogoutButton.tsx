// 기존 헤더/네비게이션 어디서든 재사용할 수 있는 로그아웃 버튼.
// form + Server Action 조합이라 JS 실행 전에도(progressive enhancement) 동작하고,
// signOut이 서버에서 실행되므로 쿠키가 확실히 정리된다.
import { logout } from "@/app/logout/actions"

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-gray-600 underline">
        로그아웃
      </button>
    </form>
  )
}
