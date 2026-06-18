"use server";

/**
 * Server Action for creating a post.
 *
 * Middleware blocks unauthenticated *page navigation* to /write, but
 * Server Actions are invoked directly (effectively their own endpoint),
 * so we re-verify the session here too. Never assume "the page was
 * protected, so this action is safe" — always re-check on the action
 * that actually performs the mutation.
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해 주세요." };
  }

  const { error } = await supabase.from("posts").insert({
    title,
    content,
    author_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { error: null };
}
