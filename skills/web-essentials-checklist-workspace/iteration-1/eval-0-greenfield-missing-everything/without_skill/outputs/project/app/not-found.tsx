import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1>404 — Page Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <Link href="/">Go back home</Link>
    </div>
  )
}
