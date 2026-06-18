import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <h1>My Blog</h1>
      {user ? (
        <p>
          {user.email}님 환영합니다. <Link href="/write">새 글 쓰기</Link>
        </p>
      ) : (
        <p>
          <Link href="/login">로그인</Link>하면 글을 쓸 수 있습니다.
        </p>
      )}
    </main>
  );
}
