'use client'

import { useActionState } from 'react'
import { submitContact, type ContactResult } from './actions'

const initialState: ContactResult = { success: false }

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: ContactResult, formData: FormData) =>
      submitContact(formData),
    initialState
  )

  return (
    <form action={formAction}>
      <input name="email" type="email" required maxLength={254} />
      <textarea name="message" required maxLength={2000} />
      <button type="submit" disabled={pending}>
        {pending ? 'Sending...' : 'Send'}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p role="status">Thanks! Your message was sent.</p>}
    </form>
  )
}
