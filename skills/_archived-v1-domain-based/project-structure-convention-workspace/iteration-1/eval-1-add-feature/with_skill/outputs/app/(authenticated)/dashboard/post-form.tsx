"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createPost } from "./actions";

export function PostForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    setError(null);

    startTransition(async () => {
      try {
        await createPost(title);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "게시글 작성에 실패했습니다");
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
    >
      <input
        type="text"
        name="title"
        placeholder="게시글 제목을 입력하세요"
        required
        disabled={isPending}
        style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: "0.25rem" }}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "작성 중..." : "작성"}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
