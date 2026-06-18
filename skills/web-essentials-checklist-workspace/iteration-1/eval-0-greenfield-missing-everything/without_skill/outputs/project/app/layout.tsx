import type { Metadata, Viewport } from 'next'
import { env } from '@/lib/env'
import './globals.css'

const siteUrl = env.NEXT_PUBLIC_SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Acme',
    template: '%s | Acme',
  },
  description: 'Acme is a Next.js + Supabase application.',
  applicationName: 'Acme',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Acme',
    title: 'Acme',
    description: 'Acme is a Next.js + Supabase application.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acme',
    description: 'Acme is a Next.js + Supabase application.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
