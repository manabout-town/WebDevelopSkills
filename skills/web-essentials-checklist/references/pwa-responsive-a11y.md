# PWA, Responsive, Accessibility Basics

## Favicon & manifest

Every project needs at minimum `app/favicon.ico` (Next.js picks this up automatically from `app/`). For a slightly more complete baseline, add `app/icon.png` (or `.svg`) and a `app/manifest.ts`:

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'App Name',
    short_name: 'App',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  }
}
```

Don't go further into full PWA territory (service workers, offline caching) unless the user explicitly asks — that's a much bigger commitment than "essentials."

## Responsive layout

Check `app/layout.tsx` has the viewport meta tag — Next.js sets a sensible default automatically via the App Router, but if a custom `viewport` export exists, verify it isn't overly restrictive (e.g. don't disable user zoom):

```ts
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
```

Beyond the meta tag, "responsive" mostly comes down to whether the actual page implementation skill used relative units / Tailwind responsive prefixes — this skill isn't responsible for auditing every component's CSS, just for making sure nothing at the root level is actively blocking responsiveness (fixed pixel-width containers on the root layout, viewport disabling zoom, etc.).

## Accessibility floor

This is a floor, not a full WCAG audit (that's `design:accessibility-review` if installed). Check for:

- A `<main>` landmark wrapping page content, and `<nav>`/`<header>`/`<footer>` used where appropriate instead of generic `<div>`s.
- A skip-to-content link if the site has a persistent nav/header:
  ```tsx
  <a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
  ```
- Images have meaningful `alt` (or `alt=""` if purely decorative) — not missing, not a filename.
- Interactive elements are real `<button>`/`<a>` tags, not `<div onClick>`, so keyboard and screen-reader users get them for free.
- Color contrast isn't this skill's job to compute, but flag anything obviously broken (light gray text on white, etc.) if you notice it while you're in there.
