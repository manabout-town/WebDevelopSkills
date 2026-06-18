// app/(seller)/seller/dashboard/page.tsx
// Lives in the (seller) route group so the folder structure makes the
// role boundary obvious. middleware.ts already prevents buyers from
// reaching anything under /seller, but this page still re-checks role
// server-side (see comment in lib/supabase guidance: never trust the
// middleware alone for anything that touches real data).
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("role, display_name")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "seller") {
    redirect("/buyer/dashboard")
  }

  // RLS on `listings` (sql/rls_policies.sql) ensures this only ever
  // returns listings owned by this seller, even if the query were copied
  // into a context without this role check.
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, status")
    .eq("seller_id", user.id)

  return (
    <main>
      <h1>판매자 대시보드</h1>
      <p>{profile?.display_name}님, 환영합니다.</p>
      <h2>내 등록 상품</h2>
      <ul>
        {listings?.map((l) => (
          <li key={l.id}>
            {l.title} — {l.price.toLocaleString()}원 ({l.status})
          </li>
        ))}
      </ul>
    </main>
  )
}
