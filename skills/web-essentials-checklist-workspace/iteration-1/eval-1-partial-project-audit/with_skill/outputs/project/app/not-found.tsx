export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <a href="/" className="underline">Go home</a>
    </main>
  )
}
