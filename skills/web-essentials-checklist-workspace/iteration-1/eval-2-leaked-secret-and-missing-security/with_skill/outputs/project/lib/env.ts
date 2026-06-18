import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Server-only secrets. Never read these on the client, never log them,
  // never write them into scripts or docs in plaintext.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  TOSS_SECRET_KEY: z.string().min(1).optional(),
})

export const env = envSchema.parse(process.env)
