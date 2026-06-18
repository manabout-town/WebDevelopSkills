#!/bin/bash
# Deploy to Vercel production.
#
# SECURITY NOTE: This script must NOT contain real secrets.
# Required environment variables (NEXT_PUBLIC_SUPABASE_URL,
# SUPABASE_SERVICE_ROLE_KEY, TOSS_SECRET_KEY, etc.) must already be
# configured in the Vercel project's Environment Variables settings
# (Project Settings -> Environment Variables), NOT exported here.
#
# If you need to set/update them, use the Vercel CLI instead, e.g.:
#   vercel env add SUPABASE_SERVICE_ROLE_KEY production
#   vercel env add TOSS_SECRET_KEY production
#
# Never commit secret values to this repo or to shell scripts.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "Running pre-deploy checks..."
npm run lint
npm run build

echo "Deploying to Vercel production..."
vercel deploy --prod
