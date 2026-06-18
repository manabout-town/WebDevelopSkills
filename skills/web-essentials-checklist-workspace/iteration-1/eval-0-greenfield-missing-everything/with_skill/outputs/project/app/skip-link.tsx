'use client'

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{ position: 'absolute', left: -9999, top: 'auto' }}
      onFocus={(e) => {
        e.currentTarget.style.position = 'fixed'
        e.currentTarget.style.left = '1rem'
        e.currentTarget.style.top = '1rem'
        e.currentTarget.style.zIndex = '50'
        e.currentTarget.style.background = '#fff'
        e.currentTarget.style.color = '#000'
        e.currentTarget.style.padding = '0.5rem 1rem'
        e.currentTarget.style.borderRadius = '4px'
      }}
      onBlur={(e) => {
        e.currentTarget.style.position = 'absolute'
        e.currentTarget.style.left = '-9999px'
      }}
    >
      Skip to content
    </a>
  )
}
