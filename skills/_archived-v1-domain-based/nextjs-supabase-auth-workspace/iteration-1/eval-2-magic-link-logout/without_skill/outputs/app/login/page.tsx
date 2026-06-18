"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInWithPassword, signInWithMagicLink } from "./actions";

type Mode = "password" | "magic-link";

const initialState = {} as { error?: string; success?: string };

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("password");

  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    initialState
  );
  const [magicLinkState, magicLinkAction, magicLinkPending] = useActionState(
    signInWithMagicLink,
    initialState
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">로그인</h1>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-md py-1.5 transition ${
            mode === "password" ? "bg-white shadow-sm" : "text-gray-500"
          }`}
        >
          비밀번호로 로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("magic-link")}
          className={`flex-1 rounded-md py-1.5 transition ${
            mode === "magic-link" ? "bg-white shadow-sm" : "text-gray-500"
          }`}
        >
          매직 링크로 로그인
        </button>
      </div>

      {mode === "password" ? (
        <form action={passwordAction} className="flex flex-col gap-3">
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
          <label className="flex flex-col gap-1 text-sm">
            비밀번호
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border px-3 py-2"
            />
          </label>

          <div className="text-right text-sm">
            <Link href="/reset-password" className="text-blue-600 hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {passwordState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {passwordState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-md bg-black py-2 text-white disabled:opacity-50"
          >
            {passwordPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      ) : (
        <form action={magicLinkAction} className="flex flex-col gap-3">
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

          {magicLinkState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {magicLinkState.error}
            </p>
          )}
          {magicLinkState?.success && (
            <p className="text-sm text-green-600" role="status">
              {magicLinkState.success}
            </p>
          )}

          <button
            type="submit"
            disabled={magicLinkPending}
            className="rounded-md bg-black py-2 text-white disabled:opacity-50"
          >
            {magicLinkPending ? "전송 중..." : "로그인 링크 보내기"}
          </button>
        </form>
      )}
    </div>
  );
}
