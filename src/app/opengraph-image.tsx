import { ImageResponse } from 'next/og';

export const alt = 'Deniqwears — The Deniq Edit';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: '#F4F1EB',
          color: '#171714',
          display: 'flex',
          height: '100%',
          padding: '62px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#681F2C',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
            padding: '52px',
            width: '100%',
          }}
        >
          <div style={{ color: '#F4F1EB', display: 'flex', fontSize: 24, letterSpacing: 8 }}>
            DENIQWEARS
          </div>
          <div style={{ color: '#FAF9F6', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'serif', fontSize: 108, lineHeight: 0.9 }}>
              The Deniq
            </div>
            <div style={{ display: 'flex', fontFamily: 'serif', fontSize: 108, fontStyle: 'italic', lineHeight: 0.9 }}>
              Edit.
            </div>
          </div>
          <div style={{ color: '#F4F1EB', display: 'flex', fontSize: 23, letterSpacing: 2 }}>
            CONTEMPORARY WOMENSWEAR · LAGOS, NIGERIA
          </div>
        </div>
      </div>
    ),
    size
  );
}
