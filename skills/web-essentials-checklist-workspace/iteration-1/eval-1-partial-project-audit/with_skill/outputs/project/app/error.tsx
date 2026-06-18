'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p>Please try again. If the problem persists, contact support.</p>
      <button onClick={() => reset()} className="underline">Try again</button>
    </main>
  )
}
