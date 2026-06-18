// 로그인 페이지 — 이메일/비밀번호 탭과 매직 링크 탭을 함께 제공한다.
// 기존 비밀번호 로그인 UX는 그대로 유지하고, 매직 링크는 별도 폼(같은 이메일 input,
// 다른 submit 액션)으로 추가했다. 두 폼이 같은 email 값을 공유하지 않아도 되도록
// 독립된 <form>으로 분리해 액션을 명확히 구분한다.
"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { loginWithPassword, loginWithMagicLink } from "./actions"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"
  const callbackError = searchParams.get("error")

  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handlePasswordSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await loginWithPassword(formData)
    setPending(false)
    if (result && "error" in result) setError(result.error)
  }

  async function handleMagicLinkSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await loginWithMagicLink(formData)
    setPending(false)
    if (result && "error" in result) {
      setError(result.error)
    } else {
      setMagicLinkSent(true)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <h1 className="text-xl font-semibold">로그인</h1>

      {callbackError === "auth-callback-failed" && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">
          로그인 링크가 만료되었거나 이미 사용되었습니다. 다시 시도해 주세요.
        </p>
      )}

      <div className="flex gap-2 border-b">
        <button
          type="button"
          className={mode === "password" ? "border-b-2 border-black pb-2" : "pb-2 text-gray-400"}
          onClick={() => {
            setMode("password")
            setError(null)
          }}
        >
          비밀번호로 로그인
        </button>
        <button
          type="button"
          className={mode === "magic-link" ? "border-b-2 border-black pb-2" : "pb-2 text-gray-400"}
          onClick={() => {
            setMode("magic-link")
            setError(null)
          }}
        >
          매직 링크로 로그인
        </button>
      </div>

      {mode === "password" && (
        <form action={handlePasswordSubmit} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            name="email"
            type="email"
            placeholder="이메일"
            required
            className="w-full rounded border p-2"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            className="w-full rounded border p-2"
          />
          <button type="submit" disabled={pending} className="w-full rounded bg-black p-2 text-white">
            로그인
          </button>
          <a href="/reset-password" className="block text-center text-sm text-gray-500 underline">
            비밀번호를 잊으셨나요?
          </a>
        </form>
      )}

      {mode === "magic-link" && (
        <>
          {magicLinkSent ? (
            <p className="rounded bg-green-50 p-3 text-sm text-green-700">
              입력하신 이메일로 로그인 링크를 보냈습니다. 메일함을 확인해 주세요.
            </p>
          ) : (
            <form action={handleMagicLinkSubmit} className="space-y-3">
              <input type="hidden" name="next" value={next} />
              <input
                name="email"
                type="email"
                placeholder="이메일"
                required
                className="w-full rounded border p-2"
              />
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded bg-black p-2 text-white"
              >
                로그인 링크 보내기
              </button>
            </form>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
