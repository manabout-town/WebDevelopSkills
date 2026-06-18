// app/(buyer)/buyer/dashboard/page.tsx
// Mirrors the seller dashboard's structure but for buyers. Shows
// browsable open listings (any seller's) plus the buyer's own orders.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function BuyerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "buyer") {
    redirect("/seller/dashboard")
  }

  // RLS allows any authenticated buyer to see open listings, and only
  // their own orders — see sql/rls_policies.sql.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price")
    .eq("status", "open")

  const { data: orders } = await supabase
    .from("orders")
    .select("id, listing_id, status")
    .eq("buyer_id", user.id)

  return (
    <main>
      <h1>구매자 대시보드</h1>
      <p>{profile?.display_name}님, 환영합니다.</p>

      <h2>둘러보기</h2>
      <ul>
        {listings?.map((l) => (
          <li key={l.id}>
            {l.title} — {l.price.toLocaleString()}원
          </li>
        ))}
      </ul>

      <h2>내 주문</h2>
      <ul>
        {orders?.map((o) => (
          <li key={o.id}>
            주문 #{o.id} — {o.status}
          </li>
        ))}
      </ul>
    </main>
  )
}
