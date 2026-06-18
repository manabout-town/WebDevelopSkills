/**
 * /write — the post-creation page.
 *
 * Middleware already redirects unauthenticated requests away from this
 * route, so under normal operation `user` below is never null. We still
 * check it here and bail with redirect() as defense-in-depth: middleware
 * matcher config can change, or this component could be reused/rendered
 * in a context where middleware didn't run.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WriteForm from "./write-form";

export default async function WritePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/write");
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <h1>새 글 작성</h1>
      <p style={{ color: "#666", fontSize: 14 }}>{user.email}로 로그인됨</p>
      <WriteForm />
    </main>
  );
}
