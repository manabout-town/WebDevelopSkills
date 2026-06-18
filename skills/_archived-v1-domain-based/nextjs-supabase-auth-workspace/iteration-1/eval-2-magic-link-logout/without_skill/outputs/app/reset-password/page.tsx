"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

const initialState = {} as { error?: string; success?: string };

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">비밀번호 재설정</h1>
        <p className="mt-1 text-sm text-gray-500">
          가입하신 이메일로 재설정 링크를 보내드립니다.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          이메일
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border px-3 py-2"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-green-600" role="status">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black py-2 text-white disabled:opacity-50"
        >
          {pending ? "전송 중..." : "재설정 링크 보내기"}
        </button>
      </form>

      <Link href="/login" className="text-center text-sm text-blue-600 hover:underline">
        로그인으로 돌아가기
      </Link>
    </div>
  );
}
