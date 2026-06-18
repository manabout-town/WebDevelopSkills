"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost, type CreatePostState } from "@/app/(authenticated)/dashboard/actions";
import { Button } from "@/components/ui/button";

const initialState: CreatePostState = {};

export function PostForm() {
  const [state, formAction, isPending] = useActionState(
    createPost,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <label htmlFor="title" className="text-sm font-medium">
        제목
      </label>
      <input
        id="title"
        name="title"
        type="text"
        required
        maxLength={200}
        placeholder="게시글 제목을 입력하세요"
        className="rounded border px-3 py-2"
        disabled={isPending}
      />
      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "게시글 작성"}
      </Button>
    </form>
  );
}
