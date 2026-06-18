"use client"

import { useState } from "react"
import { updatePassword } from "./actions"

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updatePassword(formData)
    setPending(false)
    if (result && "error" in result) setError(result.error)
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input
        name="password"
        type="password"
        placeholder="새 비밀번호 (8자 이상)"
        required
        minLength={8}
        className="w-full rounded border p-2"
      />
      <input
        name="passwordConfirm"
        type="password"
        placeholder="새 비밀번호 확인"
        required
        minLength={8}
        className="w-full rounded border p-2"
      />
      <button type="submit" disabled={pending} className="w-full rounded bg-black p-2 text-white">
        비밀번호 변경
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
