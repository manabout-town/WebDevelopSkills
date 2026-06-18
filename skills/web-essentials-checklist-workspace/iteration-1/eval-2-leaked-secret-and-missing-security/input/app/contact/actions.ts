'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitContact(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('contact_messages').insert({
    email: formData.get('email') as string,
    message: formData.get('message') as string,
  })
}
