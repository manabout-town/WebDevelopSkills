# Error Pages, 404, Loading States

## not-found.tsx

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <a href="/" className="underline">Go home</a>
    </main>
  )
}
```

Match whatever component/styling conventions the rest of the project already uses (shadcn `Button`, custom `Link` wrapper, etc.) instead of plain `<a>`/`<button>` if those exist — this is a visible user-facing page, not an internal tool, so it's worth a few minutes to make it look intentional rather than default.

## error.tsx (route-level error boundary)

Next.js requires this to be a Client Component. Add one at the root and at any route segment where a failure shouldn't take down the whole app:

```tsx
// app/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <button onClick={() => reset()} className="underline">Try again</button>
    </main>
  )
}
```

Don't render `error.message` directly to the user — it can leak internal details. Log the full error server-side (or to whatever logging/monitoring is already wired up) and show the user a generic message.

## loading.tsx

Add one per route segment that does real data fetching, so navigation gets an instant skeleton instead of a blank screen during the server round-trip:

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div className="animate-pulse h-32 rounded-md bg-muted" />
}
```

A generic pulsing block is a fine baseline. If the route already has a stable layout (e.g. a list of cards), shape the skeleton to roughly match it — that reduces layout shift when real content arrives, which matters more than the skeleton looking polished.
