export async function register() {
  // Importing this at boot forces the zod schema to run immediately, so a
  // missing/malformed env var fails fast at startup instead of surfacing
  // later when the one code path that needs it finally runs in production.
  await import('@/lib/env')
}
