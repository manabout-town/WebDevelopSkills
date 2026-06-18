# Web Essentials Checklist — Audit Summary

Ran the `web-essentials-checklist` skill against the Acme App project (Next.js 15 +
Supabase Auth) as a pre-production-deploy sweep. Findings below, category by category.

## Already present — left alone

- **Minimal auth (sign up / log in / log out)**: fully working via Supabase Auth
  Server Actions (`app/login/actions.ts`, `app/login/page.tsx`, `app/logout/actions.ts`),
  backed by proper browser/server Supabase clients (`lib/supabase/client.ts`,
  `lib/supabase/server.ts`). Did not touch the auth logic itself — only added
  `<label>`s and `required` to the login form inputs for accessibility, and added
  rate limiting (see below).
- **SEO metadata floor**: `app/layout.tsx` already had a real `title` and
  `description` (not placeholder copy). Left the content as-is, just extended the
  `metadata` object with a `title.template` and `openGraph` block, and added a
  `viewport` export.

## Missing — added

| Item | What was added |
|---|---|
| Favicon / manifest | `app/favicon.ico`, `app/icon.png` (placeholder "A" mark — replace with real brand art), `app/manifest.ts` |
| Accessibility floor | `<main id="main-content">` landmark on `app/page.tsx` and `app/login/page.tsx`; skip-to-content link in `app/layout.tsx`; labelled form inputs in the login form |
| Security headers | `next.config.ts` now sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` on all routes |
| Env var validation | `lib/env.ts` — validates `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL` with zod at boot; imported from `app/layout.tsx` so a bad/missing env var fails immediately instead of surfacing later in production. Added `zod` to `package.json`. |
| Rate limiting | `lib/rate-limit.ts` — single-instance in-memory limiter (5 requests / 60s), wired into both `login` and `signup` Server Actions, keyed by submitted email. Comment flags that it needs to be swapped for Upstash/Redis if the app scales to multiple instances. |
| SEO: robots/sitemap | `app/robots.ts` (disallows `/login`, `/logout`; allows everything else), `app/sitemap.ts` (lists the home page). Both read `NEXT_PUBLIC_SITE_URL` with a fallback to `https://example.com` — **update this env var to the real production domain before launch**. |
| Error & loading states | `app/not-found.tsx` (404), `app/error.tsx` (route-level error boundary), `app/global-error.tsx` (root-level boundary for errors in the layout itself), `app/loading.tsx` (skeleton) |
| Session refresh middleware | `middleware.ts` — minimal Supabase session-refresh middleware (was entirely missing; without it, sessions could go stale mid-app since nothing was refreshing the auth cookie on navigation) |

## Explicitly not done (out of scope for this skill)

- No Content-Security-Policy was added — flagged in the security headers reference
  as project-specific and easy to misconfigure; left as a follow-up decision for
  whoever knows the full list of third-party scripts/fonts this app will load.
- No service worker / offline caching — that's full PWA territory, not the
  "essentials" floor.
- No role-based access control, multi-step onboarding, or anything beyond
  sign-up/login/logout — that belongs to the feature lifecycle skills, not this
  checklist.

## Before actually shipping

1. Replace the placeholder favicon/icon.png with real brand artwork.
2. Set `NEXT_PUBLIC_SITE_URL` to the real production domain (used by `robots.ts` and `sitemap.ts`).
3. Run `npm install` to pull in the newly added `zod` dependency.
4. Decide on a CSP and add it once the project's third-party script/font/image list is known.
