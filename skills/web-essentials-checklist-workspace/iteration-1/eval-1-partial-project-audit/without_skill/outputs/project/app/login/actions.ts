'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

async function getClientIp() {
  const headerList = await headers()
  return (
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  )
}

export async function login(formData: FormData) {
  const ip = await getClientIp()
  const { success } = rateLimit(`login:${ip}`, 10, 60_000)
  if (!success) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signup(formData: FormData) {
  const ip = await getClientIp()
  const { success } = rateLimit(`signup:${ip}`, 5, 60_000)
  if (!success) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}
