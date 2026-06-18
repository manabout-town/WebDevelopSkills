# Setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values (this file is gitignored and must never be committed):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret — never expose to the client, never commit, never log)
   - `TOSS_SECRET_KEY` (server-only secret — never expose to the client, never commit, never log)
3. Run `npm run dev`

> Security note: previous revisions of this file and `scripts/final_deploy.command` had real-looking
> `SUPABASE_SERVICE_ROLE_KEY` and `TOSS_SECRET_KEY` values committed in plaintext. Treat both as
> compromised — rotate them in the Supabase dashboard and the Toss Payments dashboard, then update
> your local `.env.local` / deployment secret store with the new values. Do not reuse the old keys.
