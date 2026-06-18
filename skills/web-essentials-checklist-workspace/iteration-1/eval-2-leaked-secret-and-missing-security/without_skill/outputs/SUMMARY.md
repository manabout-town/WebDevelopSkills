# Pre-Deploy Security & Essentials Check — Summary

## scripts/final_deploy.command — critical finding

The script hardcoded real-looking secrets directly in plaintext and `export`ed
them before running `vercel deploy --prod`:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://acmeapp.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sbp_service_role_EXAMPLE_FAKE_KEY_1234567890abcdef"
export TOSS_SECRET_KEY="test_sk_docs_EXAMPLE_FAKE_TOSS_KEY_abcdef"
vercel deploy --prod
```

This is a serious leak risk:
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security entirely — anyone
  with this key has full read/write access to every table in the database.
- `TOSS_SECRET_KEY` is a payment-provider secret key — anyone with this key
  can call Toss Payments APIs on behalf of the merchant account.
- Both were committed to a script file in the repo, so they'd ship to git
  history, any clone, and any AI tool/log that reads the file — permanent
  exposure even after rotation if history isn't scrubbed.
- The same two values were also duplicated in plaintext in `SETUP.md`.

**What I did:**
- Rewrote `scripts/final_deploy.command` to remove all hardcoded secrets. It
  now assumes env vars are already configured in Vercel's project settings
  (or set via `vercel env add`), and runs `npm run lint && npm run build`
  before `vercel deploy --prod` as a basic pre-deploy gate.
- Rewrote `SETUP.md` to reference `.env.example` instead of printing real
  key values, and added a "Deployment" section telling future readers to
  configure secrets in Vercel's dashboard, not in scripts.

**Still required from the user (cannot be done by me):**
- Rotate both the Supabase service role key and the Toss secret key
  immediately, since they were committed to a script/doc — treat them as
  compromised even though here they were placeholder/example-looking values.
- If this was ever pushed to a real git remote, scrub it from git history
  (e.g. `git filter-repo` / BFG) in addition to rotating the keys.
- Add the real secret values to Vercel's Environment Variables UI (Production
  scope) rather than any file in the repo.

## Other gaps found and fixed

1. **No `.gitignore`** — `.env`, `.env.local`, `node_modules/`, `.next/`,
   etc. were not excluded, meaning local secrets would be committed by
   default. Added a standard Next.js `.gitignore`.

2. **No `.env.example`** — no safe template existed for required env vars.
   Added one listing `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and
   `TOSS_SECRET_KEY` with comments distinguishing public vs. server-only
   values.

3. **No security headers** — `next.config.ts` was an empty `{}`. Added
   `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
   `X-XSS-Protection`, `Permissions-Policy`, and `Strict-Transport-Security`
   headers via the `headers()` config function.

4. **Contact form had no input validation** — `app/contact/actions.ts`
   inserted raw `email`/`message` form fields straight into Supabase with
   no checks. Added email format validation, length limits (254 chars for
   email, 2000 for message), required-field checks, and a typed
   `ContactResult` return value.

5. **No error handling on the Supabase insert** — the original action
   ignored the `error` returned by `supabase.from(...).insert(...)` and gave
   no feedback to the user on failure. Wrapped the insert in try/catch,
   logged failures server-side, and returned a friendly error message.

6. **Contact form gave no user feedback** — the page never surfaced
   success/error state. Converted `app/contact/page.tsx` to a client
   component using React's `useActionState` so the form shows "Sending...",
   a success message, or a validation/server error inline. Also added
   `required`/`maxLength` attributes as a first line of client-side defense.

7. **Missing page metadata** — `app/layout.tsx` had no `<title>`,
   description, or viewport config. Added `metadata` and `viewport` exports
   (basic SEO/mobile-rendering essentials).

8. **`package.json` had no scripts and was missing `react-dom` /
   TypeScript dependencies** — there was no `dev`, `build`, `start`, or
   `lint` script, even though `SETUP.md` and the deploy script both invoke
   `npm run dev` / `npm run build`. Added the standard Next.js scripts and
   added `react-dom`, `typescript`, and `@types/*` as devDependencies so the
   project actually builds.

9. **No `tsconfig.json`** — the project has `.ts`/`.tsx` files and a `@/*`
   import alias (used in `app/contact/actions.ts`) but no TypeScript config
   to resolve it. Added a standard Next.js `tsconfig.json` with the `@/*`
   path mapping.

## Not fixed (out of scope / needs user's infrastructure access)

- Could not verify Row Level Security (RLS) policies on the
  `contact_messages` Supabase table since no SQL schema/migration files
  exist in this repo — recommend confirming in the Supabase dashboard that
  RLS is enabled and the anon role can only INSERT (not SELECT/UPDATE/DELETE)
  on that table.
- No rate limiting / CAPTCHA on the contact form — recommend adding this at
  the edge (e.g. Vercel Firewall / middleware) if spam becomes an issue.
- Secret rotation itself must be done by the user in the Supabase and Toss
  dashboards.
