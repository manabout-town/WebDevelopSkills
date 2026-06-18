# Setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values (get these from
   the Supabase dashboard and the Toss Payments dashboard — never commit
   real keys to git or to scripts):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the client)
   - `TOSS_SECRET_KEY` (server-only, never expose to the client)
3. Run `npm run dev`

## Deployment

Set the same environment variables in the Vercel project settings
(Project Settings -> Environment Variables) before deploying. Do not put
secret values in `scripts/final_deploy.command` or any other committed file.
