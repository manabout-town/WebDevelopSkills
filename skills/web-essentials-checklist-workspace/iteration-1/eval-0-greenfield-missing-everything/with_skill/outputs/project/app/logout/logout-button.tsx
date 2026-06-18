import { logout } from './actions'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">Log out</button>
    </form>
  )
}
