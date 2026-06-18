import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/dashboard/post-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("*");

  return (
    <div className="flex flex-col gap-8">
      <h1>대시보드</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">새 게시글 작성</h2>
        <PostForm />
      </section>

      <section>
        <ul className="flex flex-col gap-2">
          {posts?.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
