"use server"
// app/login/actions.ts
// Server Actions for the login page: email+password sign-in, Google OAuth
// kickoff, and logout. Kept server-side so cookies are set/cleared
// reliably (a client-only signOut() can leave other tabs / server
// components with a stale session cookie).
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function loginWithPassword(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." }
  }

  // Role-based redirect happens in middleware.ts on the next request
  // (it reads the user's role and sends them to /seller/dashboard,
  // /buyer/dashboard, or /onboarding if role isn't set yet).
  redirect("/onboarding")
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Must exactly match a Redirect URL configured in the Supabase
      // dashboard (Authentication > URL Configuration) and in the Google
      // Cloud OAuth client's Authorized redirect URIs.
      redirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  })

  if (error || !data?.url) {
    redirect("/login?error=oauth-init-failed")
  }

  redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
