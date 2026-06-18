import type { Metadata, Viewport } from 'next'
import '@/lib/env'

export const metadata: Metadata = {
  title: { default: 'Acme App', template: '%s | Acme App' },
  description: 'Acme helps small teams track their projects.',
  openGraph: {
    title: 'Acme App',
    description: 'Acme helps small teams track their projects.',
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
        {children}
      </body>
    </html>
  )
}
