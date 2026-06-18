"use server";

import { createClient } from "@/lib/supabase/server";

export async function createPost(title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");

  await supabase.from("posts").insert({ title, user_id: user.id });
}
