"use client";

import { useActionState } from "react";
import type { AuthActionResult } from "@/lib/actions/auth";

type Props = {
  mode: "login" | "signup";
  action: (prevState: unknown, formData: FormData) => Promise<AuthActionResult>;
};

/**
 * Shared email/password form for both login and signup. Uses React 19's
 * useActionState (Next.js 15 App Router) so the Server Action's returned
 * `{ error }` shape renders inline without client-side fetch boilerplate.
 */
export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="8자 이상"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {pending
          ? "처리 중..."
          : mode === "login"
          ? "로그인"
          : "회원가입"}
      </button>
    </form>
  );
}
