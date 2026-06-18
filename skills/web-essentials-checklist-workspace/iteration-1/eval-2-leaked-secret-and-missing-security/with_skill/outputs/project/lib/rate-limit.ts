// lib/rate-limit.ts — single-instance baseline, swap for Upstash/Redis if deploying multi-instance
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
