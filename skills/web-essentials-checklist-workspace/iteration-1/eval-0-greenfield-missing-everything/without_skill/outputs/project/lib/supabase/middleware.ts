import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'

/**
 * Refreshes the Supabase auth session on every request and keeps the
 * session cookie in sync between the request and response. Without this,
 * server components receive stale/expired auth state.
 *
 * Also enforces a minimal route-protection rule: unauthenticated users
 * are redirected away from /protected routes. Adjust the matcher/rule
 * below to fit real app routes.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: do not run code between createServerClient and
  // getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/protected')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You must return the supabaseResponse object as is.
  // If you're creating a new response object, make sure to:
  // 1. Pass the request in it
  // 2. Copy over the cookies
  // 3. Change the myNewResponse object instead of the supabaseResponse
  // object — otherwise the browser and server will get out of sync and
  // the user's session will be terminated prematurely.
  return supabaseResponse
}
