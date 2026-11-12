import { ANSWER_PAGES } from '@/lib/answer-pages/content';
import { EXPLAINER_PATH, EXPLAINER_TITLE } from '@/lib/cert-in-explainer/content';
import { SITE_URL } from '@/lib/site-metadata';

/**
 * Social card copy. Titles repeat each page's own title (a test checks this); subtitles
 * are short labels and make no claims. ASCII only: the card font has no other glyphs.
 */
export interface OgCard {
  title: string;
  subtitle: string;
}

const FIXED: Record<string, { path: string; card: OgCard }> = {
  home: {
    path: '/',
    card: { title: 'Guild - independent checks for the AI you ship', subtitle: 'AI systems and the apps built around them' },
  },
  audit: {
    path: '/audit',
    card: { title: 'Launch Check for apps built with Lovable, Bolt, Replit, v0 or Cursor', subtitle: 'Launch Check' },
  },
  'launch-check': {
    path: '/launch-check',
    card: { title: 'Launch self-check for apps built with Lovable, Bolt, Replit, v0 or Cursor', subtitle: 'Free self-check' },
  },
  checklist: {
    path: '/checklist',
    card: { title: 'The AI-built app launch checklist', subtitle: 'Checklist' },
  },
  'ai-risk-tier': {
    path: '/ai-risk-tier',
    card: { title: 'CERT-In AI security audit risk tier calculator', subtitle: 'Free self-check. Unofficial.' },
  },
  'cert-in-guide': {
    path: EXPLAINER_PATH,
    card: { title: EXPLAINER_TITLE, subtitle: 'Guide' },
  },
};

const answerSlug = (path: string) => `answer-${path.split('/').filter(Boolean).pop()}`;

const PATH_TO_SLUG: Record<string, string> = {};
export const OG_PAGES: Record<string, OgCard> = {};

for (const [slug, v] of Object.entries(FIXED)) {
  PATH_TO_SLUG[v.path] = slug;
  OG_PAGES[slug] = v.card;
}
for (const a of ANSWER_PAGES) {
  const slug = answerSlug(a.path);
  PATH_TO_SLUG[a.path] = slug;
  OG_PAGES[slug] = { title: a.title, subtitle: 'Short answer' };
}

/** Slug of the card for a page path, or null when the page has none. */
export function ogSlugForPath(path: string): string | null {
  return PATH_TO_SLUG[path] ?? null;
}

/** Absolute URL of the card for a page path, or null when the page has none. */
export function ogImageUrl(path: string): string | null {
  const slug = ogSlugForPath(path);
  return slug ? `${SITE_URL}/og/${slug}` : null;
}

export const OG_SIZE = { width: 1200, height: 630 } as const;
