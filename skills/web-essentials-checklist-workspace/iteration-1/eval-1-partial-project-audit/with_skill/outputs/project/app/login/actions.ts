'use server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
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

export async function signup(formData: FormData) {
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
