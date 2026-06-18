import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <form className="flex flex-col gap-2" action={login}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Log in</button>
        <button type="submit" formAction={signup}>Sign up</button>
      </form>
    </div>
  )
}
