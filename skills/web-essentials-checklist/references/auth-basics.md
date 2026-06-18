# Minimal Auth: Sign Up, Log In, Log Out

This is the floor every project needs from day one, not a full auth system. No roles, no onboarding flow, no RLS policy design — if the project actually needs any of that, treat it as a real feature and run it through the lifecycle skills (`feature-scoping` → `data-model-design` → `feature-logic-implementation` → ...) instead of bolting it on here. This skill's job is just: a visitor can create an account, log in, and log out, using Supabase Auth.

## Supabase clients

At minimum, two clients — don't skip the server one and call the browser client from server code, and don't reach for a service-role client here at all (this skill never needs to bypass RLS):

```ts
// lib/supabase/client.ts — browser
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```ts
// lib/supabase/server.ts — server components / Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

## Sign up / log in (Server Actions)

```ts
// app/login/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/')
}
```

## Log out

Easy to forget entirely — check for it explicitly, since "log in" gets built but "log out" often doesn't until someone notices there's no way to do it.

```ts
// app/logout/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

## Session check in middleware

A minimal middleware that refreshes the session is enough at this level — full route-group-based access control belongs to a real auth feature, not this baseline:

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cs) => cs.forEach(({ name, value }) => response.cookies.set(name, value)),
    } }
  )
  await supabase.auth.getUser() // refreshes the session cookie
  return response
}
```
