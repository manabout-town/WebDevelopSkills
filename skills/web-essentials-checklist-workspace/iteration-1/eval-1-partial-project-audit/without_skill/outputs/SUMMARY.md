# Production Readiness Audit - Acme App

## Already present (no changes needed)
- Email/password authentication: working login, signup, and logout via Supabase Auth Server Actions
  (`app/login/page.tsx`, `app/login/actions.ts`, `app/logout/actions.ts`)
- Page metadata: `title` and `description` already set in `app/layout.tsx`

## Found missing and added

### SEO / crawling
- `app/robots.ts` - dynamic robots.txt (Next.js metadata route), disallows `/login`, links to sitemap
- `app/sitemap.ts` - dynamic sitemap.xml covering `/` and `/login`

### Error handling / UX states
- `app/error.tsx` - route-level error boundary with retry button, logs error to console
- `app/global-error.tsx` - root-layout-level error boundary (catches errors error.tsx can't, must render its own `<html>/<body>`)
- `app/not-found.tsx` - custom 404 page with link back home
- `app/loading.tsx` - root-level loading UI with `role="status"` / `aria-live="polite"`

### Security headers
- `next.config.ts` - added `headers()` config applying to all routes:
  X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-DNS-Prefetch-Control,
  Strict-Transport-Security (HSTS), Permissions-Policy, and a Content-Security-Policy
  scoped to self + Supabase API origin.

### Environment variable validation
- `lib/env.ts` - fails fast with a clear error message if `NEXT_PUBLIC_SUPABASE_URL` or
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing/empty, instead of surfacing a cryptic runtime error later.
- `lib/supabase/client.ts` and `lib/supabase/server.ts` updated to use the validated `env` object.
- `.env.local.example` added documenting required and optional env vars.

### Rate limiting
- `lib/rate-limit.ts` - minimal in-memory fixed-window limiter (noted as dev/single-instance only;
  recommends Upstash Redis or Vercel KV for serverless/multi-instance production).
- `app/login/actions.ts` updated: `login` limited to 10 attempts/min per IP, `signup` to 5 attempts/min
  per IP, keyed off `x-forwarded-for` / `x-real-ip` headers.

### Favicon / manifest
- `app/icon.tsx` - generated PNG favicon using `next/og` `ImageResponse` (no binary asset needed,
  auto-served at `/icon`).
- `app/manifest.ts` - web app manifest (name, short_name, theme/background color, icon reference)
  via Next.js metadata route convention.
- `app/layout.tsx` - added a `viewport` export (`width=device-width`, `initialScale=1`, `themeColor`).

### Accessibility
- `app/page.tsx` - replaced bare `<div>` with a `<main>` landmark and an `<h1>` (previously had no
  heading or landmark at all).
- `app/login/page.tsx` - rewritten as a client component using `useActionState`:
  - Added `<label htmlFor>` for both inputs (previously unlabeled, inaccessible to screen readers)
  - Added `autoComplete`, `required`, `aria-required`
  - Added a visible, `role="alert"` error message tied to the form via `aria-describedby`
    (previously login/signup errors were silently swallowed - the returned `{error}` was never rendered)
  - Added `aria-busy` / disabled state + pending labels on both submit buttons
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx` all use
  appropriate landmarks/roles (`role="alert"`, `role="status"`, `aria-live="polite"`).

### Other fix found along the way
- `lib/supabase/server.ts`: the original `setAll` cookie handler was a no-op (`setAll: () => {}`),
  which meant Supabase session cookies set during refresh would silently never persist. Replaced
  with a real implementation that calls `cookieStore.set` for each cookie (wrapped in try/catch for
  the Server Component read-only case), matching the standard `@supabase/ssr` pattern.

## Not added (would need product input)
- Real distributed rate limiting (Redis/KV) - left as in-memory with an explicit upgrade note,
  since adding a paid dependency/service wasn't something to decide unilaterally.
- A real branded favicon/logo - used a generated placeholder ("A" monogram) since no design asset
  was provided.
- robots.txt/sitemap base URL defaults to `https://example.com` until `NEXT_PUBLIC_SITE_URL` is set
  in production env vars (documented in `.env.local.example`).
