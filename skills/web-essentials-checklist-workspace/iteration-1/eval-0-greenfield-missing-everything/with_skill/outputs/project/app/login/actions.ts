'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isRateLimited } from '@/lib/rate-limit'

export type AuthActionState = { error: string } | null

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = formData.get('email') as string

  if (isRateLimited(`login:${email}`)) {
    return { error: 'Too many attempts. Please try again in a minute.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = formData.get('email') as string

  if (isRateLimited(`signup:${email}`)) {
    return { error: 'Too many attempts. Please try again in a minute.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}
