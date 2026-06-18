import type { Metadata, Viewport } from 'next'
import '@/lib/env'

export const metadata: Metadata = {
  title: { default: 'Acme', template: '%s | Acme' },
  description: 'Acme helps you get things done, fast.',
  openGraph: {
    title: 'Acme',
    description: 'Acme helps you get things done, fast.',
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
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
