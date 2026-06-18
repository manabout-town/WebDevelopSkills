# Pre-Deployment Audit — Acme (Next.js + Supabase)

## Starting state

The project was a bare Next.js 15 / React 19 / `@supabase/ssr` skeleton:
`app/layout.tsx`, `app/page.tsx`, `lib/supabase/client.ts`, `lib/supabase/server.ts`,
`next.config.ts`, and a `package.json` with no scripts, no devDependencies, and
no TypeScript dependency despite `.ts`/`.tsx` files. There was no `tsconfig.json`,
no `.gitignore`, no `.env.example`, no auth UI, no middleware, no error/404/loading
pages, no SEO files, no security headers, no rate limiting, and no favicon/manifest.
It would not build, deploy, or pass a basic security review as-is.

## What was found (gaps) and what was done

### 1. Build tooling — broken
- **Found:** no `tsconfig.json`; no TypeScript, `@types/*`, ESLint, or `react-dom`
  in dependencies; no `dev`/`build`/`start`/`lint` scripts. `npm run build` was not
  possible.
- **Fixed:** added `tsconfig.json` + `next-env.d.ts`, added `typescript`,
  `@types/node`, `@types/react`, `@types/react-dom`, `react-dom`,
  `@supabase/supabase-js`, `eslint`, `eslint-config-next` to `package.json`, added
  `.eslintrc.json`, and added `dev`/`build`/`start`/`lint`/`typecheck` scripts.
- **Verified:** ran `npm install`, `tsc --noEmit`, `next build`, and `eslint .` in
  an isolated copy — all pass cleanly (build output: 13 routes, including the new
  static/dynamic pages below).

### 2. Dependency pin was broken / had a known CVE
- **Found:** `next@15.0.0` does not resolve against stable `react@19.0.0` (it wants
  a 19 RC), causing `npm install` to fail with `ERESOLVE`. `next@15.0.3` (the first
  fix attempt) carries a published CVE (see `next.config` deprecation warning during
  install).
- **Fixed:** bumped to `next@15.5.19`, the latest patched stable 15.x release,
  which installs cleanly against `react@19.0.0` and has no CVE warning.

### 3. No environment variable validation
- **Found:** `lib/supabase/client.ts` / `server.ts` read `process.env.NEXT_PUBLIC_SUPABASE_URL!`
  directly with a non-null assertion — if the env var is missing, this fails silently
  at the network layer instead of at startup, producing confusing errors.
- **Fixed:** added `lib/env.ts`, a single validated accessor that throws a clear
  error naming the missing variable. `lib/supabase/client.ts` and `server.ts` now
  import from it. Added `.env.example` documenting every variable
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only), `NEXT_PUBLIC_SITE_URL`).

### 4. No `.gitignore`
- **Found:** none — `.env.local`, `node_modules`, and `.next` would all have been
  committed.
- **Fixed:** added a standard Next.js `.gitignore` (env files, `node_modules`,
  `.next`, `.vercel`, `*.tsbuildinfo`, etc.).

### 5. No authentication flow
- **Found:** Supabase client helpers existed but nothing used them — no login,
  signup, logout, session refresh, or route protection.
- **Fixed:**
  - `middleware.ts` + `lib/supabase/middleware.ts`: refreshes the Supabase session
    on every request and redirects unauthenticated users away from `/protected/*`.
  - `lib/auth/actions.ts`: `login`, `signup`, `logout` Server Actions with input
    validation, rate limiting (see #7), and generic error messages (does not leak
    whether an email is registered).
  - `app/login/page.tsx`, `app/signup/page.tsx`: accessible forms (labeled inputs,
    `autoComplete`, `aria-describedby` hint, `role="alert"`/`role="status"` for
    messages).
  - `app/auth/callback/route.ts`: exchanges the Supabase email-confirmation code
    for a session.
  - `app/protected/page.tsx`: example authenticated page that re-checks
    `auth.getUser()` server-side (defense in depth — never trusts middleware alone).

### 6. Server-side Supabase client silently broke session persistence
- **Found:** `lib/supabase/server.ts`'s `setAll` was a no-op (`setAll: () => {}`).
  This means refreshed auth tokens were never written back to cookies — sessions
  would silently expire / users would be logged out unpredictably.
- **Fixed:** `setAll` now actually calls `cookieStore.set(...)`, wrapped in a
  try/catch for the expected Server-Component restriction (session refresh in that
  context is handled by `middleware.ts`, per Supabase's documented pattern).

### 7. No rate limiting
- **Found:** none — login/signup endpoints were open to unlimited brute-force
  attempts.
- **Fixed:** added `lib/rate-limit/index.ts`, a small in-memory fixed-window
  limiter, applied to `login` (5/min per IP) and `signup` (3/min per IP). The
  module's doc comment is explicit about its limits: per-process state only, not
  safe as the sole defense on multi-instance/serverless deployments — recommends
  swapping in Upstash Redis or a Supabase-backed table for real production scale,
  and isolates the call sites so that's a one-file change later.

### 8. No security headers / CSP
- **Found:** `next.config.ts` was `export default {}` — no headers at all.
- **Fixed:** added `headers()` in `next.config.ts` setting `Content-Security-Policy`
  (scoped to `'self'` plus the Supabase API origins for `connect-src`/`img-src`),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`, and `Strict-Transport-Security`.

### 9. No error / 404 / loading states
- **Found:** none of `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`
  existed — any render error would show Next's default crash screen, and there
  was no instant loading UI.
- **Fixed:** added all four. `error.tsx` logs (placeholder for Sentry/etc.) and
  offers a "Try again" reset button; `global-error.tsx` covers errors in the root
  layout itself; `not-found.tsx` gives a real 404 page with a link home;
  `loading.tsx` shows an `aria-live="polite"` loading state.

### 10. No SEO basics
- **Found:** no metadata beyond an implicit default title, no `robots.txt`, no
  sitemap, no Open Graph/Twitter tags.
- **Fixed:** `app/layout.tsx` now exports full `Metadata` (title template,
  description, OpenGraph, Twitter card, robots, `metadataBase` from
  `NEXT_PUBLIC_SITE_URL`) and a `Viewport` export. Added `app/robots.ts` (disallows
  `/protected` and `/api/`, links the sitemap) and `app/sitemap.ts` (lists the
  public routes). `/protected` itself also sets `robots: { index: false }`.

### 11. No favicon / manifest
- **Found:** no favicon, no app icon, no web manifest.
- **Fixed:** `app/icon.svg` (simple branded SVG, served at `/icon.svg` and picked
  up automatically by Next's metadata file convention), `app/apple-icon.tsx`
  (generates a 180×180 PNG via Next's built-in `ImageResponse` — no binary asset
  needed), and `app/manifest.ts` (PWA-style web manifest referencing the SVG icon).
  Layout metadata wires up `icons` and `manifest` accordingly.

### 12. No accessibility baseline
- **Found:** no skip link, no visible focus styles, no semantic landmark structure,
  unlabeled form inputs anywhere (there were no forms at all yet).
- **Fixed:** `app/globals.css` adds a visible `:focus-visible` outline and a
  skip-to-content link; `app/layout.tsx` wires the skip link to a single `<main
  id="main-content">` landmark (children never duplicate `<main>`); all form
  inputs in login/signup have associated `<label htmlFor>`, `autoComplete`, and
  `required`; status/error messages use `role="status"` / `role="alert"`.

## Verification performed

Ran in an isolated `/tmp` copy (not the deliverable folder) with dummy Supabase
env values:
- `npm install` — succeeds, no ERESOLVE conflicts, no CVE warnings after the
  Next.js version bump.
- `npx tsc --noEmit` — no type errors (this caught and fixed a real bug: the
  original `login`/`signup` action signatures returning `{ error: string } | void`
  are not assignable to the `<form action={...}>` prop type; both actions now
  always end in `redirect()`, carrying error text via a `?error=` query param
  instead of a return value).
- `npx next build` — succeeds. Output shows 13 routes including the new
  `/login`, `/signup`, `/protected`, `/auth/callback` (dynamic), and
  `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.svg`,
  `/apple-icon` (static/generated), plus a 64.4 kB middleware bundle.
- `npx eslint .` — no errors.

## What's still a follow-up (not fixed, by design or because it needs human input)

- **Real Supabase project values.** `.env.example` documents the required
  variables, but real `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  must be supplied via `.env.local` (gitignored) and in the hosting provider's
  environment settings before deploying.
- **Rate limiter durability.** The in-memory limiter is explicitly documented as
  insufficient for multi-instance/serverless production traffic; swap for
  Upstash Redis or a database-backed limiter before relying on it at scale.
- **Apple touch icon / OG image branding.** The icon and Apple icon are
  intentionally minimal placeholders (a blue square with "A"); replace with real
  brand assets.
- **Error reporting.** `error.tsx`/`global-error.tsx` only `console.error` today;
  wire up Sentry (or similar) before launch so errors are actually monitored.
- **CSP `'unsafe-inline'`.** The CSP allows inline scripts/styles for now since the
  app uses inline `style={{}}` props; tightening this (nonces/hashes) is a
  reasonable follow-up once a design system / CSS-in-JS strategy is finalized.
- **No automated tests.** Nothing in the original project had tests; none were
  added, since the task was a deployment-readiness audit, not feature work. A
  reasonable next step before shipping further features.
