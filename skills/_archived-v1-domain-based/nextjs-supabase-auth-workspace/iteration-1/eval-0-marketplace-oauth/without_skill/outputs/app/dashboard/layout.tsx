import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

/**
 * Shared shell for /dashboard/*. Middleware already enforces auth + role
 * routing, but we still fetch the user here (Server Component) to render
 * profile-aware chrome (email, sign-out button) without a client round
 * trip.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();

  if (!userRes.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">중고 거래 플랫폼</span>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{userRes.user.email}</span>
          <form action={signOut}>
            <button type="submit" className="underline hover:text-black">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
