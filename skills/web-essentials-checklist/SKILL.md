---
name: web-essentials-checklist
description: Audit a Next.js + Supabase web project for baseline features every shipped web app needs — favicon/PWA manifest, responsive layout, accessibility basics, security headers, env var validation, rate limiting, SEO metadata, robots.txt/sitemap.xml, 404/error pages, loading states, and minimal working login/logout — then fill in whatever is missing. Use this whenever the user says things like "is anything missing from this project", "make this production-ready", "add SEO", "add a 404 page", "set up basic auth", "harden this before launch", mentions deploying/shipping/launching, or whenever a new project is scaffolded and these basics haven't been set up yet. This is independent of the feature-by-feature lifecycle skills (feature-scoping, page-implementation, etc.) — run it any time, on any project, regardless of what stage a specific feature is in.
---

# Web Essentials Checklist

Most of the things a web app needs are specific to what it does. But a handful of things are needed by almost every web app regardless of what it does, and they're easy to forget because no single feature request naturally produces them — nobody asks for a 404 page, it just needs to exist. This skill is a checklist-and-fill pass: figure out what's missing from this list, then add it.

This is deliberately **not** part of the feature-development lifecycle (planning → design → ... → launch). Run it any time: right after scaffolding a new project, partway through, or as a pre-launch sweep. It doesn't care what stage any particular feature is in.

## How to run this

1. **Inspect the actual project** before assuming anything is missing — read `next.config.*`, `app/` structure, `middleware.ts`, `package.json`, and any existing env/config files. Don't propose adding something that's already there under a different name.
2. **Go category by category** (table below). For each, decide present / partial / missing, and say so plainly before changing anything — a quick status line per category is more useful than silently fixing things.
3. **Fill in what's missing**, using the matching reference file for implementation detail. These are small, boilerplate-y additions — there's no need to ask permission item-by-item, but do summarize what you added when done.
4. **Don't duplicate work other skills own.** If the project needs full role-based auth, multi-step onboarding, or a real payment flow, that's the feature lifecycle's job (`feature-scoping` → ... → `page-implementation`), not this skill. This skill's auth bar is "a user can sign up, log in, and log out" — nothing more.

## The checklist

| Category | Covers | Reference |
|---|---|---|
| PWA, responsive, accessibility | favicon + manifest, viewport meta, responsive base layout, semantic landmarks, skip-to-content link, alt text and keyboard-focus basics | `references/pwa-responsive-a11y.md` |
| Security & config hygiene | security headers, env var validation at boot, basic rate limiting on public endpoints | `references/security-env-ratelimit.md` |
| SEO & metadata | Next.js Metadata API defaults, Open Graph tags, `robots.txt`, `sitemap.xml` | `references/seo-robots-sitemap.md` |
| Error & loading states | `not-found.tsx`, route-level `error.tsx`, global error boundary, `loading.tsx` skeletons | `references/error-404-loading.md` |
| Minimal auth | working sign up / log in / log out with Supabase Auth — the floor, not the full role system | `references/auth-basics.md` |

## Why this is its own skill, not folded into the lifecycle skills

These items don't map to a single feature or a single lifecycle stage — they're cross-cutting infrastructure that any feature's pages end up relying on (every page can 404, every page needs a viewport meta tag, every public form is a rate-limiting target). Treating them as a standalone sweep means they don't get forgotten just because no specific feature ticket mentioned them.

## A note on scope creep

It's tempting to keep adding "essential" items to this list — analytics, internationalization, dark mode, cookie consent banners. Resist unless the user asks. The point of this skill is a tight, genuinely-universal floor, not a maximal launch checklist. If the user wants one of those, treat it as its own request and decide then whether it belongs here or needs its own skill.
