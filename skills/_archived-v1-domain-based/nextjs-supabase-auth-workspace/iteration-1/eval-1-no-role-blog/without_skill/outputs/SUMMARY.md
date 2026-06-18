# Design Summary — Login-only Middleware Protection for /write

## Goal
Personal blog SaaS, no roles/permissions model. Requirement is binary:
"is there a logged-in user?" If yes, allow `/write`. If no, redirect to `/login`.

## Approach: `@supabase/ssr` + Next.js Middleware

Used the official `@supabase/ssr` package (the current recommended approach,
replacing the deprecated `@supabase/auth-helpers-nextjs`) because it correctly
syncs the Supabase session into cookies that are readable by middleware,
Server Components, and Route Handlers alike.

### Files created

```
package.json
tsconfig.json
.env.local.example
middleware.ts                          # root-level, runs on every matched request
src/lib/supabase/client.ts             # browser client (Client Components)
src/lib/supabase/server.ts             # server client (Server Components/Actions)
src/lib/supabase/middleware.ts         # updateSession() helper used by middleware.ts
src/app/layout.tsx
src/app/page.tsx                       # home page, shows login state
src/app/login/page.tsx                 # email/password login form
src/app/write/page.tsx                 # protected page (Server Component)
src/app/write/write-form.tsx           # client form, calls the server action
src/app/write/actions.ts               # Server Action that re-checks auth + inserts post
src/app/auth/callback/route.ts         # handles email confirmation / OAuth code exchange
```

## Key decisions

1. **Middleware is the primary gate, but not the only one.**
   `middleware.ts` checks `PROTECTED_PATHS = ["/write"]` and redirects to
   `/login?redirectTo=/write` if `supabase.auth.getUser()` returns no user.
   `getUser()` (not `getSession()`) is used deliberately — it validates the
   JWT against Supabase Auth servers rather than trusting the cookie's
   claims, which matters since middleware runs on the Edge and is the
   security-relevant checkpoint.

   However, middleware can be bypassed by hitting a Server Action or API
   route directly, so `src/app/write/actions.ts` (the Server Action that
   actually inserts a post) re-checks `auth.getUser()` before writing to the
   database. This is the real backstop, along with Supabase Row Level
   Security (RLS) — see below.

2. **Middleware matcher scoped broadly, redirect logic scoped narrowly.**
   The `config.matcher` excludes only static assets, so middleware runs on
   nearly every request — this lets it refresh the auth session/cookies
   app-wide (important: Supabase access tokens expire and need silent
   refresh, or users get logged out unexpectedly). The actual "redirect to
   login" decision is scoped tightly to `PROTECTED_PATHS`, so the rest of
   the site (home page, etc.) stays public.

3. **No roles, no permission table.** Since the requirement is explicitly
   "just check login state," there's no `profiles.role` column, no RBAC
   check, nothing beyond `user !== null`. Keeping this minimal avoids
   building unneeded abstraction — if roles are needed later (e.g. multiple
   authors), the `PROTECTED_PATHS` check is the natural place to add a role
   lookup without restructuring the middleware.

4. **`redirectTo` query param** preserves where the user was headed so
   `/login` can send them back to `/write` after signing in, instead of
   dumping them on the homepage.

5. **Server Component double-check in `write/page.tsx`.** Even though
   middleware should already have redirected unauthenticated requests away,
   the page itself also calls `getUser()` and `redirect()`s if absent. This
   guards against matcher misconfiguration or future refactors that
   accidentally stop running middleware on this route — cheap insurance.

6. **`/auth/callback/route.ts`** is included even though a bare
   email/password flow doesn't strictly need it, because any real app
   eventually adds magic links, email confirmation, or OAuth — all of which
   redirect back with a `?code=`. Cheaper to include now than to debug a
   broken redirect later.

## What's intentionally NOT included
- No roles/permissions table or RBAC logic (explicitly out of scope).
- No RLS policy SQL file — but it is **strongly recommended** the user add
  a Supabase RLS policy on the `posts` table such as:
  `author_id = auth.uid()` for INSERT/UPDATE/DELETE, since middleware and
  Server Action checks protect the Next.js app layer, not the database
  layer. If someone calls the Supabase REST/JS API directly with a stolen
  anon key + no session, RLS is what actually stops them.
- No signup page (only login) — can be added as a mirror of `login/page.tsx`
  using `supabase.auth.signUp()`.

## Setup notes for the developer
1. `npm install` (or pnpm/yarn) to pull in `@supabase/ssr` and `@supabase/supabase-js`.
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL + anon key.
3. Create a `posts` table in Supabase with at least `id, title, content, author_id, created_at`,
   and enable RLS with a policy restricting writes to `author_id = auth.uid()`.
