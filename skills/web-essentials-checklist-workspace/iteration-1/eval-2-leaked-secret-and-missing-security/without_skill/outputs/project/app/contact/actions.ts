'use server'
import { createClient } from '@/lib/supabase/server'

export type ContactResult = {
  success: boolean
  error?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_MESSAGE_LENGTH = 2000
const MAX_EMAIL_LENGTH = 254

export async function submitContact(
  formData: FormData
): Promise<ContactResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const message = (formData.get('message') as string | null)?.trim() ?? ''

  // Basic input validation — never trust client input.
  if (!email || !message) {
    return { success: false, error: 'Email and message are required.' }
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_messages').insert({
      email,
      message,
    })

    if (error) {
      console.error('Failed to insert contact message:', error.message)
      return {
        success: false,
        error: 'Something went wrong. Please try again later.',
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error submitting contact form:', err)
    return {
      success: false,
      error: 'Something went wrong. Please try again later.',
    }
  }
}
