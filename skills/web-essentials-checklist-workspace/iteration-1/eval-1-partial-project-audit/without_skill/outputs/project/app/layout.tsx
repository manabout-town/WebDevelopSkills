import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Acme App',
  description: 'Acme helps small teams track their projects.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
