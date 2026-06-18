// 비밀번호 재설정 "요청" 페이지 — 이메일을 입력받아 재설정 링크를 보낸다.
// 실제 새 비밀번호 입력은 /update-password에서 이뤄진다 (메일 링크 클릭 후 도착).
"use client"

import { useState } from "react"
import { requestPasswordReset } from "./actions"

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await requestPasswordReset(formData)
    setPending(false)
    if (result && "error" in result) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-xl font-semibold">비밀번호 재설정</h1>

      {sent ? (
        <p className="rounded bg-green-50 p-3 text-sm text-green-700">
          입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다. 메일함을 확인해 주세요.
        </p>
      ) : (
        <form action={handleSubmit} className="space-y-3">
          <input
            name="email"
            type="email"
            placeholder="가입한 이메일"
            required
            className="w-full rounded border p-2"
          />
          <button type="submit" disabled={pending} className="w-full rounded bg-black p-2 text-white">
            재설정 링크 보내기
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <a href="/login" className="block text-center text-sm text-gray-500 underline">
        로그인으로 돌아가기
      </a>
    </div>
  )
}
