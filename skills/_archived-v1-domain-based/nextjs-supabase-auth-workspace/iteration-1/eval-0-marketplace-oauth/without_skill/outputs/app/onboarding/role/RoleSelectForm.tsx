"use client";

import { useActionState } from "react";
import { setUserRole } from "@/lib/actions/auth";

const ROLES = [
  {
    value: "buyer",
    title: "구매자",
    description: "물건을 둘러보고 구매하고 싶어요.",
  },
  {
    value: "seller",
    title: "판매자",
    description: "물건을 등록하고 판매하고 싶어요.",
  },
] as const;

export function RoleSelectForm() {
  const [state, formAction, pending] = useActionState(setUserRole, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLES.map((role) => (
          <label
            key={role.value}
            className="flex cursor-pointer flex-col gap-1 rounded-lg border border-gray-300 p-4 text-left hover:border-black [&:has(input:checked)]:border-black [&:has(input:checked)]:ring-1 [&:has(input:checked)]:ring-black"
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              required
              className="sr-only"
            />
            <span className="font-medium">{role.title}</span>
            <span className="text-sm text-gray-500">{role.description}</span>
          </label>
        ))}
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
        {pending ? "저장 중..." : "선택 완료"}
      </button>
    </form>
  );
}
