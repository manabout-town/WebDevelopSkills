"use server"
// app/signup/actions.ts
// Signup is intentionally minimal: just create the auth account.
// Role selection and role-specific profile fields are deferred to
// /onboarding (see app/onboarding/actions.ts) so this form doesn't need to
// know about seller vs buyer at all.
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function signUpWithPassword(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const origin = (await headers()).get("origin")

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Only relevant if email confirmation is enabled in Supabase Auth
      // settings; harmless no-op otherwise.
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is OFF, signUp already returns a live session and
  // the user can go straight to onboarding. If it's ON, they'll need to
  // click the confirmation email first (which lands on /auth/callback).
  redirect("/onboarding")
}

export async function signUpWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  })

  if (error || !data?.url) {
    redirect("/signup?error=oauth-init-failed")
  }

  redirect(data.url)
}
