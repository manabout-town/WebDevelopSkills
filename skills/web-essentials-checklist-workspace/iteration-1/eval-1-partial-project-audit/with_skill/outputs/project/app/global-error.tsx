'use client'

// Root-level error boundary: catches errors that occur in the root layout itself,
// which app/error.tsx cannot catch. Must render its own <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p>Please try again. If the problem persists, contact support.</p>
          <button onClick={() => reset()} className="underline">Try again</button>
        </main>
      </body>
    </html>
  )
}
