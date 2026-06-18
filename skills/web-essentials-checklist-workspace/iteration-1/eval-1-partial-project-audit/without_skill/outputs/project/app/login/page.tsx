'use client'

import { useActionState } from 'react'
import { login, signup } from './actions'

type ActionResult = { error?: string } | undefined

export default function LoginPage() {
  const [loginResult, loginAction, loginPending] = useActionState<
    ActionResult,
    FormData
  >(async (_prev, formData) => login(formData), undefined)
  const [signupResult, signupAction, signupPending] = useActionState<
    ActionResult,
    FormData
  >(async (_prev, formData) => signup(formData), undefined)

  const error = loginResult?.error || signupResult?.error

  return (
    <main style={{ maxWidth: 360, margin: '4rem auto', padding: '0 1rem' }}>
      <h1>Log in</h1>
      <form aria-describedby={error ? 'auth-error' : undefined}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="password">Password</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-required="true"
          />
        </div>

        {error && (
          <p id="auth-error" role="alert" style={{ color: 'crimson' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            formAction={loginAction}
            disabled={loginPending}
            aria-busy={loginPending}
          >
            {loginPending ? 'Logging in...' : 'Log in'}
          </button>
          <button
            formAction={signupAction}
            disabled={signupPending}
            aria-busy={signupPending}
          >
            {signupPending ? 'Signing up...' : 'Sign up'}
          </button>
        </div>
      </form>
    </main>
  )
}
