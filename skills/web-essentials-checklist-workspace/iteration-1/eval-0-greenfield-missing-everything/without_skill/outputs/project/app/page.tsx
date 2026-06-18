import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '3rem 1.5rem' }}>
      <h1>Welcome to Acme</h1>
      <p>A Next.js + Supabase application.</p>
      <nav aria-label="Account">
        <Link href="/login">Log in</Link>
        {' · '}
        <Link href="/signup">Sign up</Link>
      </nav>
    </div>
  )
}
