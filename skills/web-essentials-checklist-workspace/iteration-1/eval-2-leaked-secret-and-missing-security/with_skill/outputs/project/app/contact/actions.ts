'use server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/rate-limit'

export async function submitContact(formData: FormData) {
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') ?? 'unknown'

  if (isRateLimited(`contact:${ip}`)) {
    return { error: 'Too many submissions. Please try again in a minute.' }
  }

  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!email || !message) {
    return { error: 'Email and message are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({ email, message })

  if (error) {
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}
