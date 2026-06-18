import type { Metadata, Viewport } from 'next'
import { SkipLink } from './skip-link'
import { SiteNav } from './site-nav'

export const metadata: Metadata = {
  title: { default: 'Acme', template: '%s | Acme' },
  description: 'Acme is a web application built with Next.js and Supabase.',
  openGraph: {
    title: 'Acme',
    description: 'Acme is a web application built with Next.js and Supabase.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <header>
          <SiteNav />
        </header>
        <main id="main-content">{children}</main>
        <footer>{/* Site footer goes here */}</footer>
      </body>
    </html>
  )
}
