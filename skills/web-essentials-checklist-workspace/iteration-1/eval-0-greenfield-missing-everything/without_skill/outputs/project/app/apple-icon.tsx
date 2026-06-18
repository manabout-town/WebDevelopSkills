import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Generated at request/build time via Next's built-in ImageResponse —
// avoids needing to hand-author a binary PNG asset.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563eb',
          color: '#ffffff',
          fontSize: 96,
          fontWeight: 700,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        A
      </div>
    ),
    { ...size }
  )
}
