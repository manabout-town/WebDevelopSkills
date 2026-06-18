import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout/logout-button'

export async function SiteNav() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <nav aria-label="Main navigation">
      {data.user ? <LogoutButton /> : <a href="/login">Log in</a>}
    </nav>
  )
}
