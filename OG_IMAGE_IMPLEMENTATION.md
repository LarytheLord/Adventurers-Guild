# Dynamic OG Image for Quest Pages

## API Route

Create `app/api/og/quests/[id]/route.tsx`:

```tsx
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const quest = await fetchQuest(params.id);
  
  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#e94560', marginBottom: 12 }}>
          {quest.title}
        </div>
        <div style={{ fontSize: 24, color: '#a8a8b3', padding: '0 60px', textAlign: 'center' }}>
          {quest.description?.slice(0, 100)}
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 20 }}>
          <span style={{ fontSize: 20 }}>Rank: {quest.rank}</span>
          <span style={{ fontSize: 20, color: '#ffd700' }}>{quest.reward} XP</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

## Meta Tags

In quest page component:

```tsx
export function generateMetadata({ params }) {
  const url = `${process.env.NEXT_PUBLIC_URL}/api/og/quests/${params.id}`;
  return {
    openGraph: { images: [{ url, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [url] },
  };
}
```

## Setup

```bash
npm install @vercel/og
```

## Performance

- Edge runtime: global low-latency
- Images cached by Vercel CDN
- ~100-300ms generation time
