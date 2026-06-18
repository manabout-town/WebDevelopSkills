import { createClient } from "@/lib/supabase/server";
import { PostForm } from "./post-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("*");

  return (
    <div>
      <h1>대시보드</h1>
      <PostForm />
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
