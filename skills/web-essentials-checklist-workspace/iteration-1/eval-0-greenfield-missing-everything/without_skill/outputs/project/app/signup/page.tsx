import type { Metadata } from 'next'
import Link from 'next/link'
import { signup } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Sign up</h1>
      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}
      <form action={signup} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required style={{ display: 'block', width: '100%' }} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="password-hint" style={{ display: 'block', width: '100%' }} />
          <p id="password-hint" style={{ fontSize: '0.85rem', color: '#555' }}>
            At least 8 characters.
          </p>
        </div>
        <button type="submit">Sign up</button>
      </form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
