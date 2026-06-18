import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Seller dashboard. Middleware blocks buyers from reaching this route, but
 * we re-check the role here too (defense in depth — never trust a single
 * layer for access control, especially with RLS-backed data underneath).
 */
export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userRes.user.id)
    .single();

  if (profile?.role !== "seller") {
    redirect(profile?.role ? `/dashboard/${profile.role}` : "/onboarding/role");
  }

  // RLS (see supabase/migrations/0003_listings_example.sql) already scopes
  // this query to the current seller's own listings.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price_cents, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          판매자 대시보드{profile?.full_name ? `, ${profile.full_name}님` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          등록한 상품을 관리하고 판매 현황을 확인하세요.
        </p>
      </div>

      <section className="rounded-lg border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-medium">내 상품 목록</h2>
          <button className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800">
            상품 등록
          </button>
        </div>
        {listings && listings.length > 0 ? (
          <ul className="divide-y">
            {listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3">
                <span>{l.title}</span>
                <span className="text-sm text-gray-500">
                  {(l.price_cents / 100).toLocaleString()}원 · {l.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-gray-500">
            아직 등록한 상품이 없습니다.
          </p>
        )}
      </section>
    </div>
  );
}
