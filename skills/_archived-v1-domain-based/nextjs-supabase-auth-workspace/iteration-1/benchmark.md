# Skill Benchmark: nextjs-supabase-auth

**Model**: claude-sonnet-4-6
**Date**: 2026-06-17T12:00:00Z
**Evals**: 0, 1, 2 (1 run each per configuration)

## Summary

| Metric | With Skill | Without Skill | Delta |
|--------|------------|----------------|-------|
| Pass Rate | 100% ± 0% | 88% ± 11% | +0.12 |
| Time | 213.3s ± 43.6s | 228.4s ± 82.9s | -15.1s |
| Tokens | 80722 ± 5114 | 73897 ± 11416 | +6824 |

## Per-eval pass rate

- **marketplace-oauth**: with_skill 6/6, without_skill 5/6
- **no-role-blog**: with_skill 5/5, without_skill 4/5
- **magic-link-logout**: with_skill 5/5, without_skill 5/5

## Notes

- Each eval ran once per configuration (not 3x) — single-run comparison, so stddev is 0 within an eval but pass_rate/time/token stats below are aggregated across the 3 different evals.
- eval-0 without_skill: missing the dedicated service-role Supabase client (browser/server/middleware clients all present, but no service.ts) — with_skill correctly separates all four client types.
- eval-1 without_skill: no logout mechanism implemented at all (no signOut call anywhere in the codebase) — with_skill includes a server-side logout Server Action.
- eval-2: both configurations passed all assertions — magic-link + logout + password-reset is a well-known enough pattern that the baseline got it right without the skill.
- Assertion 'Auth callback route uses exchangeCodeForSession' and 'RLS enabled' passed 100% in both configurations across applicable evals — may not strongly differentiate skill value going forward.
- with_skill runs took longer and used more tokens on eval-1 only; mixed/inconclusive on time and tokens overall, but consistently equal-or-higher pass rate.