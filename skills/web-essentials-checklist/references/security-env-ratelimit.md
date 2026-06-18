# Security Headers, Env Var Validation, Rate Limiting

## Security headers

Add baseline headers in `next.config.ts` so they apply everywhere without touching every route:

```ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

export default {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}
```

Don't reach for a full Content-Security-Policy unless asked — a misconfigured CSP breaks things in ways that are annoying to debug, and it's genuinely project-specific (depends on what third-party scripts/fonts/images the project loads). Flag that one as a follow-up rather than guessing at it.

## Env var validation at boot

The failure mode this prevents: a missing or malformed env var doesn't surface until the one code path that uses it runs in production, often hours after deploy. Validate eagerly instead, e.g. with `zod` in a small `lib/env.ts` imported from the root layout or instrumentation file:

```ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // server-only, see warning below
})

export const env = envSchema.parse(process.env)
```

**This is also where the "no plaintext secrets" principle matters most concretely**: never let `SUPABASE_SERVICE_ROLE_KEY` or any other secret key end up logged, committed to a deploy script, or written into a `.md` setup doc in plaintext — only ever read it from `process.env` on the server. If you find a secret key already sitting in plaintext somewhere in the repo (a `.command` script, a setup doc, a committed `.env`), flag it immediately and tell the user to rotate it — don't just quietly fix the file, since the key may already be compromised.

## Basic rate limiting

For any public-facing endpoint that's cheap to abuse (login, signup, contact form, anything unauthenticated that writes data), add a lightweight rate limit. If the project already has Upstash/Redis available, use a sliding-window limiter; otherwise a simple in-memory limiter is an acceptable baseline for a single-instance deploy (note in a comment that it won't hold up across multiple server instances, so it should be revisited if the project scales out):

```ts
// lib/rate-limit.ts — single-instance baseline, swap for Upstash if deploying multi-instance
const hits = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  entry.count += 1
  return entry.count > limit
}
```
