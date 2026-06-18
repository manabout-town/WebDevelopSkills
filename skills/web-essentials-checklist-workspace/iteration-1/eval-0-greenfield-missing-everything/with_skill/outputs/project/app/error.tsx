'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Log the full error server-side / to monitoring; never render error.message directly to the user.
  console.error(error)

  return (
    <div style={{ display: 'flex', minHeight: '60vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
