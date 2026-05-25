import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CheatLens — Find any dating profile in seconds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Renders the same brand mark used in the header (BrandMark.tsx): a magnifying
// glass with a heart in the lens, on the site's dark background + red glow.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(255,45,92,0.34) 0%, rgba(10,10,15,0) 55%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <svg width="148" height="148" viewBox="0 0 32 32" fill="none">
            <circle cx="13" cy="13" r="9" stroke="#fff" strokeWidth="2.4" />
            <line
              x1="19.4"
              y1="19.4"
              x2="27"
              y2="27"
              stroke="#fff"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              fill="#fff"
              d="M13 17.1C11.1 14.9 8.6 13.1 8.6 10.8 8.6 9.4 9.7 8.3 11 8.3c1 0 1.7.6 2 1.2.3-.6 1-1.2 2-1.2 1.3 0 2.4 1.1 2.4 2.5 0 2.3-2.5 4.1-4.4 6.3Z"
            />
          </svg>
          <span
            style={{
              fontSize: 118,
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.03em',
            }}
          >
            CheatLens
          </span>
        </div>
        <span style={{ fontSize: 40, color: '#c2c2cc', marginTop: 30 }}>
          Find any dating profile in seconds
        </span>
      </div>
    ),
    { ...size }
  );
}
