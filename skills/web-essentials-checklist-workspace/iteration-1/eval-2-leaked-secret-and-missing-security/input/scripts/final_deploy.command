#!/bin/bash
export NEXT_PUBLIC_SUPABASE_URL="https://acmeapp.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sbp_service_role_EXAMPLE_FAKE_KEY_1234567890abcdef"
export TOSS_SECRET_KEY="test_sk_docs_EXAMPLE_FAKE_TOSS_KEY_abcdef"
vercel deploy --prod
