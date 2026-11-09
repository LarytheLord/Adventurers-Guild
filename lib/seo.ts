import type { Metadata } from 'next';
import {
  EXPLAINER_DESCRIPTION,
  EXPLAINER_FAQ,
  EXPLAINER_PATH,
  EXPLAINER_PUBLISHED,
  EXPLAINER_TITLE,
  stripLinks,
} from '@/lib/cert-in-explainer/content';

/** Pinned: production serves from www.guilds.work; env vars may hold an old domain. */
export const SITE_URL = 'https://www.guilds.work';
export const SITE_NAME = 'Guild';
export const LOGO_PATH = '/logo/guild-logo.png';

/** Profiles that already exist in the codebase (site footer). Do not add others without a source. */
export const SAME_AS = ['https://github.com/LarytheLord/Adventurers-Guild', 'https://x.com/guild_india'];

/** The public marketing pages. Sitemap and llms.txt are checked against this list. */
export const PUBLIC_PAGES = [
  { path: '/', priority: 1 },
  { path: '/audit', priority: 0.9 },
  { path: '/checklist', priority: 0.8 },
  { path: '/ai-risk-tier', priority: 0.9 },
  { path: '/guides/cert-in-ai-security-auditing-guidelines', priority: 0.9 },
] as const;

/** Paths crawlers must not fetch. */
export const DISALLOWED_PATHS = ['/api/', '/admin/', '/dashboard/', '/login', '/register', '/forgot-password', '/reset-password'];

export const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];

export function absoluteUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

interface PageMetaInput {
  path: string;
  title: string;
  description: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

export function buildPageMetadata({ path, title, description, type = 'website', keywords }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const image = absoluteUrl(LOGO_PATH);
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: 'en_IN',
      images: [{ url: image, width: 1254, height: 1254, alt: 'Guild logo' }],
    },
    twitter: { card: 'summary', title, description, images: [image] },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(LOGO_PATH),
    description:
      'Guild tests AI systems and the apps built around them, and writes down what we find. Guild is not a CERT-In empanelled auditor.',
    sameAs: SAME_AS,
  };
}

export function softwareApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CERT-In AI risk tier calculator',
    url: absoluteUrl('/ai-risk-tier'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (web browser)',
    description:
      'Free self-check: score an AI system on the eight risk factors in the CERT-In AI Security Auditing Guidelines and see its tier. Runs in your browser. Unofficial; not an audit.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };
}

/** Serialise for a script tag; escape "<" so content can never close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Article and FAQPage for the CERT-In guide. Questions and answers come straight from the guide's own FAQ. */
export function explainerJsonLd() {
  const pageUrl = absoluteUrl(EXPLAINER_PATH);
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: EXPLAINER_TITLE,
      description: EXPLAINER_DESCRIPTION,
      datePublished: EXPLAINER_PUBLISHED,
      dateModified: EXPLAINER_PUBLISHED,
      inLanguage: 'en-IN',
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      author: org,
      publisher: org,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: EXPLAINER_FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: stripLinks(f.a) },
      })),
    },
  ];
}
