export default function Loading() {
  // Shown automatically by Next.js while a route segment's data is
  // loading (instant loading UI via React Suspense boundaries).
  return (
    <div role="status" aria-live="polite" style={{ padding: '2rem' }}>
      <p>Loading…</p>
    </div>
  )
}
