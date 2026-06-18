// Single-instance, in-memory rate limiter. This is an acceptable baseline for a
// single-instance deploy, but it will NOT hold up across multiple server instances
// (each instance has its own Map, so limits aren't shared). Swap for an
// Upstash/Redis-backed sliding-window limiter before deploying multi-instance.
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
