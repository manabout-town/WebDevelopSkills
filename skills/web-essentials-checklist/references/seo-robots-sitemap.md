# SEO, Metadata, robots.txt, sitemap.xml

## Metadata API defaults

Every project needs at least a root-level default in `app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: { default: 'App Name', template: '%s | App Name' },
  description: 'One real sentence describing what this app does.',
  openGraph: {
    title: 'App Name',
    description: 'Same sentence, or a slightly punchier version.',
    type: 'website',
  },
}
```

Don't write generic placeholder copy ("Welcome to our website") — ask the user for the one-sentence description if it's not obvious from the project, since this is the line that shows up in search results and link previews. Individual routes that matter for search (landing pages, public content pages) should override `title`/`description` via their own `metadata` export or `generateMetadata`; routes behind auth generally don't need SEO attention.

## robots.txt

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

Adjust the `disallow` list to match whatever in this project shouldn't be crawled (auth-only routes, internal admin areas, API routes) — don't just copy the example disallow list blindly.

## sitemap.xml

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://example.com', lastModified: new Date(), priority: 1 },
    { url: 'https://example.com/about', lastModified: new Date(), priority: 0.5 },
  ]
}
```

For a project with a handful of static public pages, list them by hand. If the project has a large number of dynamic public pages (e.g. one per blog post or listing), generate the sitemap entries from the same data source those pages render from, rather than hand-maintaining a list that will drift out of date.

Both `robots.ts` and `sitemap.ts` need a real production URL, not `example.com` — pull it from an env var (`NEXT_PUBLIC_SITE_URL` or similar) if one already exists in the project, or ask the user for the domain rather than guessing.
