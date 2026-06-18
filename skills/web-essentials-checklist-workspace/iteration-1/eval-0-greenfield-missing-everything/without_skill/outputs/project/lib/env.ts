/**
 * Centralized, validated access to environment variables.
 *
 * Import from here instead of reading `process.env` directly so that:
 *  - missing/empty required vars fail fast at startup with a clear error
 *    instead of surfacing as a confusing runtime bug later (e.g. a
 *    Supabase client silently created with `undefined` as the URL).
 *  - we have one place that documents which env vars the app needs.
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill in real values.`
    )
  }
  return value
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv(
    'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  // Optional: only needed for server-side admin operations (service role).
  // Never expose this to the client / never prefix with NEXT_PUBLIC_.
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  // Used for absolute URLs in metadata, sitemap, robots, OG tags, etc.
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const
