'use client'

import { useEffect } from 'react'

/**
 * Route-level error boundary. Catches errors thrown while rendering a
 * route segment (and its children) and shows a recoverable fallback
 * instead of a blank screen / full crash.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Replace with real error reporting (Sentry, etc.) before launch.
    console.error('Unhandled route error:', error)
  }, [error])

  return (
    <div role="alert" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>
        An unexpected error occurred. You can try again, or come back
        later if the problem persists.
      </p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
