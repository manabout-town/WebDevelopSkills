'use client'

import { useActionState } from 'react'
import { login, signup, type AuthActionState } from './actions'

const initialState: AuthActionState = null

export function LoginForm() {
  const [loginState, loginAction, loginPending] = useActionState(login, initialState)
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState)

  return (
    <div style={{ maxWidth: 360, margin: '4rem auto' }}>
      <h1>Log in</h1>

      <form action={loginAction}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {loginState?.error && <p role="alert">{loginState.error}</p>}
        <button type="submit" disabled={loginPending}>
          Log in
        </button>
      </form>

      <form action={signupAction}>
        <div>
          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" name="password" type="password" required autoComplete="new-password" />
        </div>
        {signupState?.error && <p role="alert">{signupState.error}</p>}
        <button type="submit" disabled={signupPending}>
          Sign up
        </button>
      </form>
    </div>
  )
}
