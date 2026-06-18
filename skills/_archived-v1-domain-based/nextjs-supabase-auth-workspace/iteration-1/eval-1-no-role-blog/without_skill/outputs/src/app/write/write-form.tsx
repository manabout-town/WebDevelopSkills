"use client";

import { useState } from "react";
import { createPost } from "./actions";

export default function WriteForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await createPost(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 24 }}>
      <label>
        제목
        <input
          name="title"
          required
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      <label>
        내용
        <textarea
          name="content"
          required
          rows={10}
          style={{ display: "block", width: "100%", padding: 8 }}
        />
      </label>

      {error && <p style={{ color: "crimson", fontSize: 14 }}>{error}</p>}

      <button type="submit" disabled={pending} style={{ padding: 10 }}>
        {pending ? "게시 중..." : "게시하기"}
      </button>
    </form>
  );
}
