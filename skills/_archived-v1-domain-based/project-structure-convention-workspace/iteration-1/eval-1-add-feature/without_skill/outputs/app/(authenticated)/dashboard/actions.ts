"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreatePostState = {
  error?: string;
  success?: boolean;
};

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const title = formData.get("title");

  if (typeof title !== "string" || title.trim().length === 0) {
    return { error: "제목을 입력해주세요" };
  }

  if (title.length > 200) {
    return { error: "제목은 200자 이내로 입력해주세요" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const { error } = await supabase
    .from("posts")
    .insert({ title: title.trim(), user_id: user.id });

  if (error) {
    return { error: "게시글 저장에 실패했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/dashboard");

  return { success: true };
}
