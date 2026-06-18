"use client";

import { signOut } from "./actions";

/**
 * Drop-in logout button, e.g. in a header/nav. Uses the server action
 * directly as the form's action so it works without client-side JS
 * fetch plumbing and degrades gracefully.
 */
export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-gray-600 hover:text-black hover:underline"
      >
        로그아웃
      </button>
    </form>
  );
}
