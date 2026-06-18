export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <span>Loading...</span>
    </main>
  )
}
