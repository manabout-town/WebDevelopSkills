// Single-instance, in-memory baseline rate limiter for cheap-to-abuse public endpoints
// (login, signup, etc.). This will NOT hold up across multiple server instances --
// swap for an Upstash/Redis-backed sliding-window limiter if this app scales out
// to more than one instance.
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
