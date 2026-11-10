import { ImageResponse } from 'next/og';

export const alt = 'Cafe Connect: order ahead and skip the queue';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 90, background: '#12293b', color: '#ffffff' }}>
        <div style={{ fontSize: 34, color: '#f5a524', fontWeight: 700 }}>Cafe Connect</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>Order ahead.</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, color: '#f5a524' }}>Skip the queue.</div>
      </div>
    ),
    size,
  );
}
