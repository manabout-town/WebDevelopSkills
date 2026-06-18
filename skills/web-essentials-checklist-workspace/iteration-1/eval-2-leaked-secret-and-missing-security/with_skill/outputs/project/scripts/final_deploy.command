#!/bin/bash
# Secrets must NOT be hardcoded here. Export them in your shell profile,
# your CI secret store, or a local .env file that is gitignored — never
# commit them in this script.
#
# Required env vars (set these outside of this file):
#   NEXT_PUBLIC_SUPABASE_URL
#   SUPABASE_SERVICE_ROLE_KEY
#   TOSS_SECRET_KEY
set -euo pipefail

required_vars=(NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY TOSS_SECRET_KEY)
for var in "${required_vars[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "Missing required env var: $var" >&2
    exit 1
  fi
done

vercel deploy --prod
