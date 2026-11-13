// Registry for the /guides index. It lists routes and groups only. Titles and one-line
// descriptions are read from each page's own `metadata` export in app/guides/page.tsx, so
// they cannot drift from the pages. To list a new page: add it to a group below and import
// its metadata in app/guides/page.tsx. The tests fail if either step is missed.

export const GUIDES_HUB_PATH = '/guides';

export type GuideKind = 'guide' | 'tool' | 'service';

export interface GuideItem {
  path: string;
  kind: GuideKind;
}

export interface GuideGroup {
  id: string;
  title: string;
  intro: string;
  items: GuideItem[];
}

export const GUIDE_GROUPS: GuideGroup[] = [
  {
    id: 'launching',
    title: 'Launching AI-built apps',
    intro: 'For apps made with Lovable, Bolt, Replit, v0 or Cursor, before real users and real money arrive.',
    items: [
      { path: '/launch-check', kind: 'tool' },
      { path: '/checklist', kind: 'tool' },
      { path: '/guides/check-supabase-rls-lovable-bolt', kind: 'guide' },
    ],
  },
  {
    id: 'india-ai-rules',
    title: 'India AI rules',
    intro: 'The CERT-In AI Security Auditing Guidelines, explained, with a free self-check. Unofficial and not legal advice.',
    items: [
      { path: '/guides/cert-in-ai-security-auditing-guidelines', kind: 'guide' },
      { path: '/guides/does-cert-in-require-an-ai-audit', kind: 'guide' },
      { path: '/guides/what-is-an-ai-risk-tier-cert-in', kind: 'guide' },
      { path: '/ai-risk-tier', kind: 'tool' },
    ],
  },
  {
    id: 'indian-language-ai',
    title: 'Indian-language AI',
    intro: 'Quality checks for AI that speaks Hindi, Gujarati or Hinglish. This is a pilot offer, not an audit.',
    items: [{ path: '/indic-ai-qa', kind: 'service' }],
  },
];

export function allGuideItems(): GuideItem[] {
  return GUIDE_GROUPS.flatMap((g) => g.items);
}

/** Page titles end with " - Guild"; the hub shows the bare title. */
export function cleanTitle(title: string): string {
  return title.replace(/\s+-\s+Guild$/, '').trim();
}

/** First sentence of a metadata description, so each entry is one line. */
export function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  const m = flat.match(/^.*?[.!?](?=\s+[A-Z]|$)/);
  return m ? m[0] : flat;
}
