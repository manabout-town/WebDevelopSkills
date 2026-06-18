import type { Metadata } from 'next'
import Link from 'next/link'
import { login } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Log in',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const { message, error } = await searchParams

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Log in</h1>
      {message && (
        <p role="status" style={{ color: '#15803d' }}>
          {message}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {error}
        </p>
      )}
      <form action={login} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required style={{ display: 'block', width: '100%' }} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} style={{ display: 'block', width: '100%' }} />
        </div>
        <button type="submit">Log in</button>
      </form>
      <p>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  )
}
