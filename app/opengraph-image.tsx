import { ImageResponse } from 'next/og';

// Branded fallback OG image used by every route that doesn't define its own
// (home, info pages, categories). 1200×630 PNG matches Facebook's preferred
// aspect (~1.91:1) and minimum size, which is what was missing — most of the
// site had no og:image at all and FB couldn't show a preview.
export const runtime = 'edge';
export const alt = 'Ámantis · Bienestar e intimidad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#FAF6F1';
const PRIMARY = '#7C0E22';
const FG_MUTED = '#5C5048';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: PRIMARY,
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontWeight: 600,
            fontSize: 168,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          Ámantis
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: 'sans-serif',
            fontSize: 40,
            color: FG_MUTED,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Bienestar e intimidad
        </div>
      </div>
    ),
    { ...size },
  );
}
