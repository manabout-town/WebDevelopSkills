import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();

  if (userRes.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userRes.user.id)
      .single();

    redirect(profile?.role ? `/dashboard/${profile.role}` : "/onboarding/role");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold">중고 거래 플랫폼</h1>
      <p className="text-gray-500">
        구매자와 판매자를 위한 가장 쉬운 중고 거래.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          회원가입
        </Link>
      </div>
    </main>
  );
}
