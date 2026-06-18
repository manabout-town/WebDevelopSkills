import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BuyerDashboardPage() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userRes.user.id)
    .single();

  if (profile?.role !== "buyer") {
    redirect(profile?.role ? `/dashboard/${profile.role}` : "/onboarding/role");
  }

  // Public RLS policy exposes only status = 'active' listings to buyers.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price_cents, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          구매자 대시보드{profile?.full_name ? `, ${profile.full_name}님` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          판매 중인 상품을 둘러보세요.
        </p>
      </div>

      <section className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">판매 중인 상품</h2>
        </div>
        {listings && listings.length > 0 ? (
          <ul className="divide-y">
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3">
                <span>{l.title}</span>
                <span className="text-sm text-gray-500">
                  {(l.price_cents / 100).toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-gray-500">
            현재 판매 중인 상품이 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
