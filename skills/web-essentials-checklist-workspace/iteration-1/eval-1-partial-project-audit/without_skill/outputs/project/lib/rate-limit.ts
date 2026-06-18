// Minimal in-memory fixed-window rate limiter for single-instance / dev use.
// For production on serverless or multi-instance deployments, replace this
// with a shared store such as Upstash Redis (@upstash/ratelimit) or
// Vercel KV, since in-memory state does not persist across instances.

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
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
