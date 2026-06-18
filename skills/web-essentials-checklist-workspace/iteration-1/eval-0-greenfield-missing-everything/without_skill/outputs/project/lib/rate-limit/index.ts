/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * IMPORTANT LIMITATIONS — read before relying on this in production:
 *  - State is per-server-process. On serverless/multi-instance deploys
 *    (Vercel, etc.) each instance has its own counters, so the effective
 *    limit is (limit × number of warm instances), not a global limit.
 *  - State is lost on cold start / redeploy.
 *
 * This is good enough to blunt naive scripted abuse (e.g. login/signup
 * brute-forcing) on a single-instance deploy or during local dev, but
 * for a real production guarantee, replace with a durable shared store,
 * e.g. Upstash Redis (`@upstash/ratelimit`) or Supabase itself via a
 * `rate_limits` table + RPC. The call sites (login/signup actions) are
 * isolated in lib/auth/actions.ts so swapping the implementation later
 * only requires changing this file.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  }
}
