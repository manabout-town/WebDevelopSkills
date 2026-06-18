'use client'

import { useEffect } from 'react'

/**
 * Last-resort error boundary for errors thrown in the root layout itself
 * (where app/error.tsx cannot help, since it lives inside the layout).
 * Must render its own <html>/<body> because it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div role="alert" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>A critical error occurred. Please reload the page.</p>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
