import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

/**
 * Example authenticated route. Middleware already redirects unauthenticated
 * requests away from /protected/*, but we re-check here too: defense in
 * depth, and this is what actually lets us read the user's data safely
 * (never trust middleware alone for authorization decisions).
 */
export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div style={{ padding: '3rem 1.5rem' }}>
      <h1>Dashboard</h1>
      <p>Signed in as {data.user.email}</p>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </div>
  )
}
