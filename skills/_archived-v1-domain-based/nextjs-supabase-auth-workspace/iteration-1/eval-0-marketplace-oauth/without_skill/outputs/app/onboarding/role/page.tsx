import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleSelectForm } from "./RoleSelectForm";

/**
 * Shown right after first sign-in (email/password OR Google) when
 * profiles.role is still NULL. Middleware (lib/supabase/middleware.ts)
 * already guarantees only users without a role can reach this page, and
 * redirects users who already have one straight to their dashboard — this
 * server-side check is a defense-in-depth backstop, not the primary gate.
 */
export default async function RoleOnboardingPage() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();

  if (!userRes.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userRes.user.id)
    .single();

  if (profile?.role) {
    redirect(`/dashboard/${profile.role}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">어떻게 이용하실 건가요?</h1>
        <p className="mt-1 text-sm text-gray-500">
          역할은 가입 시 한 번만 선택할 수 있어요. 나중에 바꿀 수 없으니
          신중하게 골라주세요.
        </p>
      </div>
      <RoleSelectForm />
    </main>
  );
}
