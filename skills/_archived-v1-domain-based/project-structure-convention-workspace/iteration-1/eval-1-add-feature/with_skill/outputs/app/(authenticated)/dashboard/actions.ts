"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  if (!title || !title.trim()) {
    throw new Error("제목을 입력해주세요");
  }

  const { error } = await supabase
    .from("posts")
    .insert({ title: title.trim(), user_id: user.id });

  if (error) {
    throw new Error("게시글 작성에 실패했습니다");
  }

  revalidatePath("/dashboard");
}
