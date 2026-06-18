# Web Essentials Checklist — Audit Summary

Project: `acme-app` (Next.js 15 + React 19 + Supabase, App Router)
Task: pre-deployment audit, fill in whatever's missing.

## Status before any changes

| Category | Status | Notes |
|---|---|---|
| PWA, responsive, accessibility | Missing | No favicon, no manifest, no viewport export, no semantic landmarks (`<body>` had a bare `<div>`), no skip link |
| Security & config hygiene | Missing | No security headers in `next.config.ts`, no env validation, no rate limiting, no `zod` dependency |
| SEO & metadata | Missing | No `metadata` export, no `robots.ts`, no `sitemap.ts` |
| Error & loading states | Missing | No `not-found.tsx`, `error.tsx`, or `loading.tsx` |
| Minimal auth | Partial | Supabase browser/server clients existed, but no middleware, no login/signup/logout UI or actions, and the server client's `setAll` was a no-op that silently dropped cookie writes |

Also missing, found while inspecting the project (not on the skill's checklist but required for anything above to actually work): `tsconfig.json`, `package.json` scripts, `react-dom`, `@supabase/supabase-js` (peer dep of `@supabase/ssr`), and a `.gitignore`.

## What was added

**PWA / responsive / accessibility**
- `app/favicon.ico`, `app/icon.png` (512×512), `app/manifest.ts`
- `app/layout.tsx`: added `metadata` + `viewport` exports, semantic `<header>/<nav>/<main>/<footer>` instead of a bare `<div>`, and a `<SkipLink>` ("Skip to content" → `#main-content`, hidden until focused — implemented as a small client component since inline event handlers aren't allowed in a Server Component)
- `app/page.tsx`: changed the root `<div>Welcome to Acme</div>` to use a real `<h1>` heading

**Security & config hygiene**
- `next.config.ts`: added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` headers on all routes. Did **not** add a Content-Security-Policy — that's project-specific (depends on third-party scripts/fonts the app ends up loading) and a misconfigured CSP breaks things in hard-to-debug ways, so this is flagged as a follow-up rather than guessed at.
- `lib/env.ts`: zod schema validating `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL`, optional `SUPABASE_SERVICE_ROLE_KEY` (server-only, never logged).
- `instrumentation.ts`: imports `lib/env.ts` at boot so the app fails fast on a bad/missing env var instead of failing deep in a request handler later.
- `lib/rate-limit.ts`: in-memory sliding-window-ish limiter (5 req/60s default), wired into the login and signup Server Actions, keyed by submitted email. Commented as a single-instance baseline — flagged to swap for Upstash/Redis if the app ever runs multi-instance.
- `.env.example` documenting the four env vars above with no real values.

**SEO & metadata**
- `app/layout.tsx` root `metadata`: title template `%s | Acme`, a description, and matching Open Graph tags.
- `app/robots.ts`: allows `/`, disallows `/api` (no `/admin` or other private routes exist yet to disallow).
- `app/sitemap.ts`: single entry for `/` (the only public page that currently exists).
- Both robots/sitemap read `NEXT_PUBLIC_SITE_URL` and fall back to `https://example.com` if unset — **a decision point**: the project gave no real domain, so I added the env var and documented it in `.env.example` rather than guessing a domain. This needs a real value before launch.

**Error & loading states**
- `app/not-found.tsx`, `app/error.tsx` (Client Component, logs the real error server-side via `console.error` and shows the user a generic message — never renders `error.message` directly), `app/loading.tsx` (pulsing skeleton block).

**Minimal auth**
- `middleware.ts`: refreshes the Supabase session cookie on every request (matcher excludes static assets).
- Fixed `lib/supabase/server.ts`: the original `setAll: () => {}` silently dropped all cookie writes, which would have broken session persistence for every sign-in/sign-out. Replaced with a real cookie-writing implementation wrapped in try/catch (writes from Server Components are expected to no-op; middleware handles the actual refresh).
- `app/login/actions.ts`: `login` and `signup` Server Actions, each rate-limited, using `useActionState`'s `(prevState, formData)` signature so errors surface in the UI instead of being silently swallowed.
- `app/login/login-form.tsx` + `app/login/page.tsx`: client form using `useActionState`, two separate `<form>`s (login / sign up) so each has its own pending/error state.
- `app/logout/actions.ts` + `app/logout/logout-button.tsx`: logout Server Action and button.
- `app/site-nav.tsx`: server component that checks the current Supabase session and renders "Log in" or the logout button accordingly; wired into `app/layout.tsx`'s header.

**Supporting infrastructure (not on the skill's checklist itself, but required for the above to compile/run)**
- `tsconfig.json` with the `@/*` path alias (none existed; without it, none of the `@/lib/...` imports used throughout the reference patterns would resolve).
- `package.json`: added `scripts` (`dev`/`build`/`start`/`lint`), `react-dom`, `zod`, `@supabase/supabase-js` (a peer dependency `@supabase/ssr` needs but which was missing — without it the build fails with `Module not found`), and TypeScript dev dependencies.
- `.gitignore` (none existed) covering `node_modules`, `.next`, `.env*`, build artifacts.

## Verification

Ran `npm install --legacy-peer-deps` and `next build` with dummy env vars. The project compiles and builds successfully — all routes generate correctly: `/`, `/login`, `/_not-found`, `icon.png`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml`, plus the middleware bundle. Caught and fixed three real TypeScript errors along the way (implicit-`any` cookie callback params in both Supabase client files, and a `formAction` return-type mismatch in the original login button approach).

## Flagged, not fixed (outside this skill's scope or needs a human decision)

1. **`next@15.0.0` has a known CVE** (npm prints a deprecation warning citing CVE-2025-66478 on install). This is a pre-existing pin in the original `package.json`, not something this pass changed — recommend upgrading to a patched Next.js version before launch.
2. **No Content-Security-Policy** — intentionally not added; needs to be scoped against whatever third-party scripts/fonts/images this app ends up using.
3. **`NEXT_PUBLIC_SITE_URL` has no real value** — `robots.ts`/`sitemap.ts` fall back to `https://example.com` until someone sets the real production domain.
4. **SEO description text is generic** ("Acme is a web application built with Next.js and Supabase.") because the project gave no actual product description anywhere (the only content in the repo was `<div>Welcome to Acme</div>`). This should be replaced with a real one-sentence description once the product copy exists — flagging per the skill's own guidance not to ship permanent placeholder copy unexamined.
5. Auth here is intentionally the floor only (sign up / log in / log out) — no email verification flow, password reset, or RLS policy review, since that's the feature lifecycle's job, not this checklist's.
