import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acme App',
  description: 'Acme helps small teams track their projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
