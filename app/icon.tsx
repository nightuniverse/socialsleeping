import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '-4px',
            lineHeight: 1,
          }}
        >
          SS
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
