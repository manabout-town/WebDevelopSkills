import { logout } from './actions'

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  )
}
