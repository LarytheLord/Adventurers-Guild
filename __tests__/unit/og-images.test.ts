import { readFileSync } from 'fs';
import { join } from 'path';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { OG_PAGES, ogImageUrl, ogSlugForPath } from '@/lib/og';
import { INDIC_QA_PATH, INDIC_QA_TITLE } from '@/lib/indic-ai-qa/content';
import { ANSWER_PAGES } from '@/lib/answer-pages/content';
import { EXPLAINER_PATH, EXPLAINER_TITLE } from '@/lib/cert-in-explainer/content';
import { PUBLIC_PAGES } from '@/lib/seo';

const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);
const root = join(__dirname, '..', '..');

// Pages that must carry a generated social image.
const PATHS = [
  '/',
  '/audit',
  '/launch-check',
  '/checklist',
  '/ai-risk-tier',
  INDIC_QA_PATH,
  EXPLAINER_PATH,
  ...ANSWER_PAGES.map((a) => a.path),
];

describe('og:image in page metadata', () => {
  it.each(PATHS)('%s has an og:image URL on www.guilds.work', (path) => {
    const m = buildPageMetadata({ path, title: 'T', description: 'D' });
    const images = (m.openGraph as { images: { url: string; width: number; height: number }[] }).images;
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe(ogImageUrl(path));
    expect(images[0].url.startsWith(`${SITE_URL}/og/`)).toBe(true);
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
  });

  it.each(PATHS)('%s uses a large twitter card with the same image', (path) => {
    const m = buildPageMetadata({ path, title: 'T', description: 'D' });
    const tw = m.twitter as { card: string; images: string[] };
    expect(tw.card).toBe('summary_large_image');
    expect(tw.images).toEqual([ogImageUrl(path)]);
  });

  it('falls back to the logo for a path with no card', () => {
    const m = buildPageMetadata({ path: '/audit/sample-report', title: 'T', description: 'D' });
    const images = (m.openGraph as { images: { url: string }[] }).images;
    expect(images[0].url).toBe(`${SITE_URL}/logo/guild-logo.png`);
  });
});

describe('og card registry', () => {
  it('covers every path above and every public page', () => {
    for (const p of PATHS) expect(OG_PAGES[ogSlugForPath(p) as string]).toBeDefined();
    for (const p of PUBLIC_PAGES) expect(ogSlugForPath(p.path)).not.toBeNull();
  });

  it('is plain ASCII and never claims empanelment', () => {
    for (const c of Object.values(OG_PAGES)) {
      expect(isAscii(c.title)).toBe(true);
      expect(isAscii(c.subtitle)).toBe(true);
      expect(`${c.title} ${c.subtitle}`).not.toMatch(/empanel/i);
    }
  });

  it('uses the same title as the page', () => {
    expect(OG_PAGES[ogSlugForPath(EXPLAINER_PATH) as string].title).toBe(EXPLAINER_TITLE);
    expect(OG_PAGES[ogSlugForPath(INDIC_QA_PATH) as string].title).toBe(INDIC_QA_TITLE.replace(/ - Guild$/, ''));
    for (const a of ANSWER_PAGES) expect(OG_PAGES[ogSlugForPath(a.path) as string].title).toBe(a.title);
    const fromSource = (file: string) =>
      /const TITLE =\s*'([^']+)'/.exec(readFileSync(join(root, file), 'utf8'))?.[1].replace(/ - Guild$/, '');
    expect(OG_PAGES[ogSlugForPath('/audit') as string].title).toBe(fromSource('app/audit/page.tsx'));
    expect(OG_PAGES[ogSlugForPath('/checklist') as string].title).toBe(fromSource('app/checklist/page.tsx'));
    expect(OG_PAGES[ogSlugForPath('/ai-risk-tier') as string].title).toBe(fromSource('app/ai-risk-tier/page.tsx'));
    expect(OG_PAGES[ogSlugForPath('/launch-check') as string].title).toBe(fromSource('app/launch-check/page.tsx'));
  });

  it('has a route file that renders with ImageResponse', () => {
    const src = readFileSync(join(root, 'app/og/[slug]/route.tsx'), 'utf8');
    expect(src).toContain('ImageResponse');
    expect(src).toContain('guilds.work');
  });
});
