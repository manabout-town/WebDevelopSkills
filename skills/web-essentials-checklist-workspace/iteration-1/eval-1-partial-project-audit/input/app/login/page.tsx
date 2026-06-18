import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}
