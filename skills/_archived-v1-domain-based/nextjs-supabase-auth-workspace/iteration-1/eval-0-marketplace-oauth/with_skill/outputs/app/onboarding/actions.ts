"use server"
// app/onboarding/actions.ts
// Runs once, right after a user has an auth account but no role yet
// (signup via password landed them here; Google OAuth first-timers land
// here too via /auth/callback?next=/onboarding).
//
// Why the service-role client is needed here specifically: the very first
// write to `public.users` / role-profile tables happens before the user
// has a `role`, and several RLS policies on those tables are written in
// terms of "a row may only be created for your own auth.uid() AND your
// users.role must already be set to X" — which is circular on the very
// first insert. The service client bypasses that chicken-and-egg problem
// for this one bootstrap write. Every other read/write after onboarding
// goes through the normal RLS-scoped server/browser clients.
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

const ROLE_TO_DASHBOARD: Record<string, string> = {
  seller: "/seller/dashboard",
  buyer: "/buyer/dashboard",
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "로그인이 필요합니다." }
  }

  const role = formData.get("role") as string
  if (role !== "seller" && role !== "buyer") {
    return { error: "역할을 선택해주세요." }
  }

  const displayName = (formData.get("displayName") as string)?.trim()
  if (!displayName) {
    return { error: "이름(닉네임)을 입력해주세요." }
  }

  const service = createServiceClient()

  // 1) Upsert the base user row with the chosen role.
  const { error: userError } = await service.from("users").upsert({
    id: user.id,
    email: user.email!,
    role,
    display_name: displayName,
  })

  if (userError) {
    return { error: "프로필 생성에 실패했습니다. 다시 시도해주세요." }
  }

  // 2) Create the role-specific profile row. Seller and buyer profiles are
  //    separate tables because their required fields diverge over time
  //    (e.g. seller payout info) without forcing one wide nullable table.
  if (role === "seller") {
    const storeName = (formData.get("storeName") as string)?.trim() || displayName

    const { error: profileError } = await service.from("seller_profiles").upsert({
      user_id: user.id,
      store_name: storeName,
    })
    if (profileError) {
      return { error: "판매자 프로필 생성에 실패했습니다." }
    }
  } else {
    const { error: profileError } = await service.from("buyer_profiles").upsert({
      user_id: user.id,
    })
    if (profileError) {
      return { error: "구매자 프로필 생성에 실패했습니다." }
    }
  }

  redirect(ROLE_TO_DASHBOARD[role])
}
