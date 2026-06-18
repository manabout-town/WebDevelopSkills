'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}

/**
 * All actions below always end in `redirect()`, which throws internally —
 * that keeps the function's effective return type compatible with the
 * `(formData: FormData) => void | Promise<void>` signature React expects
 * for a <form action={...}>. Errors are communicated back to the user via
 * a `?error=` query param on the redirect target rather than a returned
 * value, so we don't need useActionState/client components for this
 * simple case.
 */

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/login?error=Email and password are required.')
  }

  const ip = await clientIp()
  const { success } = rateLimit(`login:${ip}`, {
    limit: 5,
    windowMs: 60_000,
  })
  if (!success) {
    redirect('/login?error=Too many attempts. Please try again in a minute.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Generic message — don't leak whether the email exists.
    redirect('/login?error=Invalid email or password.')
  }

  redirect('/protected')
}

export async function signup(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect('/signup?error=Email and password are required.')
  }
  if (password.length < 8) {
    redirect('/signup?error=Password must be at least 8 characters.')
  }

  const ip = await clientIp()
  const { success } = rateLimit(`signup:${ip}`, {
    limit: 3,
    windowMs: 60_000,
  })
  if (!success) {
    redirect('/signup?error=Too many attempts. Please try again in a minute.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Check your email to confirm your account')
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
