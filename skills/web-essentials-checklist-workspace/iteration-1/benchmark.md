# web-essentials-checklist 평가 결과 (iteration 1)

- 평가 일시: 2026-06-17T16:43:17Z
- 실행 모델: claude-sonnet-4-6
- 평가 개수: 3개, 구성당 실행 횟수: 1회

## 종합 요약

| 항목 | with_skill | without_skill | Delta |
|---|---|---|---|
| Pass rate (평균) | 100% | 93% | +0.07 |
| 소요 시간(초, 평균) | 422.2 | 512.1 | -89.9 |
| 토큰(평균) | 101746 | 99637 | +2109 |

## 평가별 결과

| Eval | Config | Pass | 시간(초) | 토큰 |
|---|---|---|---|---|
| greenfield-missing-everything | with_skill | 9/9 (100%) | 750.5 | 132514 |
| greenfield-missing-everything | without_skill | 9/9 (100%) | 915.8 | 132529 |
| partial-project-audit | with_skill | 8/8 (100%) | 256.3 | 87508 |
| partial-project-audit | without_skill | 8/8 (100%) | 455.4 | 100734 |
| leaked-secret-and-missing-security | with_skill | 5/5 (100%) | 259.8 | 85216 |
| leaked-secret-and-missing-security | without_skill | 4/5 (80%) | 165.2 | 65649 |

## 분석 노트

- Eval 2 (leaked-secret-and-missing-security) is the clearest discriminator: without_skill fixed the leaked keys and warned generically about not committing secrets, but did not explicitly say the exposed keys are likely compromised and must be rotated, and it stopped at the security fix without covering the rest of the checklist (no robots/sitemap/error pages/login-logout/env validation/rate limiting). with_skill did both.
- Eval 0 and Eval 1 show both configurations performing similarly well on file-existence checks (both with_skill and without_skill independently arrived at a similar set of Next.js best practices), since a capable model already knows most of these individually. The skill's main value-add shown so far is making the explicit security-rotation warning and the full-checklist coverage reliable rather than incidental.
- without_skill took longer on average in eval 0 (915s vs 750s) for a similar pass rate, suggesting the skill's reference files save some exploration/decision time even when the end result is comparable.
- Sample size is 1 run per configuration per eval (3 evals total) - pass rate stddev of 0 within a config is expected and not meaningful; a larger run count would be needed to assess variance.

## 세부 expectation 목록

### greenfield-missing-everything / with_skill

- ✅ Adds real page metadata (title + description) to app/layout.tsx instead of leaving it blank, with a non-placeholder description
  - 근거: layout.tsx metadata export present=True, has substantive description=True
- ✅ Adds app/robots.ts and app/sitemap.ts
  - 근거: robots=app/robots.ts, sitemap=app/sitemap.ts
- ✅ Adds error.tsx, not-found.tsx, and at least one loading.tsx
  - 근거: error=app/error.tsx, not-found=app/not-found.tsx, loading=app/loading.tsx
- ✅ Adds security headers via next.config.ts headers()
  - 근거: next.config.ts contains headers()+security header names: True
- ✅ Adds env var validation (e.g. lib/env.ts) for Supabase env vars
  - 근거: lib/env.ts present=True
- ✅ Adds rate limiting on auth actions
  - 근거: rate-limit call found in app/login/actions.ts: True
- ✅ Adds favicon/icon and a web app manifest
  - 근거: icon=app/favicon.ico, manifest=app/manifest.ts
- ✅ Implements working login, signup, and logout via Supabase Auth Server Actions
  - 근거: login+signup in actions=True, logout present=True
- ✅ Writes a clear SUMMARY.md explaining what was found and added
  - 근거: SUMMARY.md length=7194 chars

### greenfield-missing-everything / without_skill

- ✅ Adds real page metadata (title + description) to app/layout.tsx instead of leaving it blank, with a non-placeholder description
  - 근거: layout.tsx metadata export present=True, has substantive description=True
- ✅ Adds app/robots.ts and app/sitemap.ts
  - 근거: robots=app/robots.ts, sitemap=app/sitemap.ts
- ✅ Adds error.tsx, not-found.tsx, and at least one loading.tsx
  - 근거: error=app/error.tsx, not-found=app/not-found.tsx, loading=app/loading.tsx
- ✅ Adds security headers via next.config.ts headers()
  - 근거: next.config.ts contains headers()+security header names: True
- ✅ Adds env var validation (e.g. lib/env.ts) for Supabase env vars
  - 근거: lib/env.ts present=True
- ✅ Adds rate limiting on auth actions
  - 근거: rate-limit call found in lib/auth/actions.ts: True
- ✅ Adds favicon/icon and a web app manifest
  - 근거: icon=app/icon.svg, manifest=app/manifest.ts
- ✅ Implements working login, signup, and logout via Supabase Auth Server Actions
  - 근거: login+signup in actions=True, logout present=True
- ✅ Writes a clear SUMMARY.md explaining what was found and added
  - 근거: SUMMARY.md length=9681 chars

### partial-project-audit / with_skill

- ✅ Leaves the existing working login/signup/logout Server Actions intact (does not rewrite the core auth logic) and reports them as already present rather than redoing them
  - 근거: core auth calls preserved=True, SUMMARY mentions already-present auth=True
- ✅ Leaves existing page metadata (title/description) intact rather than replacing it with something generic
  - 근거: original title/brand string retained in layout.tsx=True
- ✅ Adds app/robots.ts and app/sitemap.ts
  - 근거: robots=app/robots.ts, sitemap=app/sitemap.ts
- ✅ Adds error/404/loading pages
  - 근거: error=app/error.tsx, not-found=app/not-found.tsx, loading=app/loading.tsx
- ✅ Adds security headers via next.config.ts
  - 근거: headers() with security header names present=True
- ✅ Adds env var validation
  - 근거: lib/env.ts present=True
- ✅ Adds favicon/manifest
  - 근거: icon=app/favicon.ico, manifest=app/manifest.ts
- ✅ SUMMARY.md clearly distinguishes already-present items from newly-added items
  - 근거: SUMMARY.md length=3686, contains distinguishing language=True

### partial-project-audit / without_skill

- ✅ Leaves the existing working login/signup/logout Server Actions intact (does not rewrite the core auth logic) and reports them as already present rather than redoing them
  - 근거: core auth calls preserved=True, SUMMARY mentions already-present auth=True
- ✅ Leaves existing page metadata (title/description) intact rather than replacing it with something generic
  - 근거: original title/brand string retained in layout.tsx=True
- ✅ Adds app/robots.ts and app/sitemap.ts
  - 근거: robots=app/robots.ts, sitemap=app/sitemap.ts
- ✅ Adds error/404/loading pages
  - 근거: error=app/error.tsx, not-found=app/not-found.tsx, loading=app/loading.tsx
- ✅ Adds security headers via next.config.ts
  - 근거: headers() with security header names present=True
- ✅ Adds env var validation
  - 근거: lib/env.ts present=True
- ✅ Adds favicon/manifest
  - 근거: icon=app/icon.tsx, manifest=app/manifest.ts
- ✅ SUMMARY.md clearly distinguishes already-present items from newly-added items
  - 근거: SUMMARY.md length=4152, contains distinguishing language=True

### leaked-secret-and-missing-security / with_skill

- ✅ Explicitly warns that the discovered SUPABASE_SERVICE_ROLE_KEY and TOSS_SECRET_KEY are likely compromised and must be rotated, not just silently removed from the file
  - 근거: explicit rotate/compromised language found=True; secret values removed from SETUP.md=True
- ✅ Removes the plaintext secret values from scripts/final_deploy.command and SETUP.md
  - 근거: secret removed from deploy script=True, from SETUP.md=True
- ✅ Still completes the broader essentials checklist (robots/sitemap, error/404/loading pages, login/logout, env validation, rate limiting) rather than stopping at the security fix alone
  - 근거: robots=True sitemap=True error=True not-found=True loading=True login=True logout=True env=True rate-limit=True
- ✅ Adds security headers via next.config.ts
  - 근거: headers() with security header names present=True
- ✅ Adds .env.example and .gitignore
  - 근거: .env.example=.env.example, .gitignore=.gitignore

### leaked-secret-and-missing-security / without_skill

- ✅ Explicitly warns that the discovered SUPABASE_SERVICE_ROLE_KEY and TOSS_SECRET_KEY are likely compromised and must be rotated, not just silently removed from the file
  - 근거: explicit rotate/compromised language found=True; secret values removed from SETUP.md=True
- ✅ Removes the plaintext secret values from scripts/final_deploy.command and SETUP.md
  - 근거: secret removed from deploy script=True, from SETUP.md=True
- ❌ Still completes the broader essentials checklist (robots/sitemap, error/404/loading pages, login/logout, env validation, rate limiting) rather than stopping at the security fix alone
  - 근거: robots=False sitemap=False error=False not-found=False loading=False login=False logout=False env=False rate-limit=False
- ✅ Adds security headers via next.config.ts
  - 근거: headers() with security header names present=True
- ✅ Adds .env.example and .gitignore
  - 근거: .env.example=.env.example, .gitignore=.gitignore
