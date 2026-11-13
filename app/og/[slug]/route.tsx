import { ImageResponse } from 'next/og';
import { OG_PAGES, OG_SIZE } from '@/lib/og';

export const runtime = 'nodejs';

// Same palette as the site: dark navy base, orange accent (--primary, hsl 25 95% 53%).
const BG = 'linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111827 100%)';
const ACCENT = '#f97316';

export function generateStaticParams() {
  return Object.keys(OG_PAGES).map((slug) => ({ slug }));
}

export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const card = OG_PAGES[slug];
  if (!card) return new Response('Not found', { status: 404 });

  const size = card.title.length > 60 ? 54 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 72,
          background: BG,
          color: '#ffffff',
          borderLeft: `16px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: ACCENT }}>Guild</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: size, fontWeight: 700, lineHeight: 1.15 }}>{card.title}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#94a3b8', marginTop: 28 }}>{card.subtitle}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#cbd5e1' }}>guilds.work</div>
      </div>
    ),
    { ...OG_SIZE, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } },
  );
}
