import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Cafe Connect: order ahead and skip the queue';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The picture shown when someone shares a link to the site.
export default async function OpenGraphImage() {
  const icon = await readFile(join(process.cwd(), 'public', 'brand', 'icon-512.png'));
  const iconSrc = `data:image/png;base64,${icon.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 90, background: '#12293b', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img. */}
          <img src={iconSrc} width={96} height={96} alt="" style={{ borderRadius: 22 }} />
          <div style={{ fontSize: 40, color: '#f5a524', fontWeight: 700 }}>Cafe Connect</div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, marginTop: 36 }}>Order ahead.</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, color: '#f5a524' }}>Skip the queue.</div>
      </div>
    ),
    size,
  );
}
