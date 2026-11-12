import type { Metadata } from 'next';
import { ogImageUrl, OG_SIZE } from '@/lib/og';
import { ANSWER_PUBLISHED, type AnswerPage } from '@/lib/answer-pages/content';
import {
  INDIC_QA_CITATION,
  INDIC_QA_DESCRIPTION,
  INDIC_QA_PATH,
  INDIC_QA_PUBLISHED,
  INDIC_QA_TITLE,
} from '@/lib/indic-ai-qa/content';
import {
  EXPLAINER_DESCRIPTION,
  EXPLAINER_FAQ,
  EXPLAINER_PATH,
  EXPLAINER_PUBLISHED,
  EXPLAINER_TITLE,
  stripLinks,
} from '@/lib/cert-in-explainer/content';
import {
  CHECKLIST_DESCRIPTION,
  CHECKLIST_PATH,
  CHECKLIST_PUBLISHED,
  CHECKLIST_TITLE,
} from '@/lib/cert-in-explainer/evidence-checklist';

/** Pinned: production serves from www.guilds.work; env vars may hold an old domain. */
export const SITE_URL = 'https://www.guilds.work';
export const SITE_NAME = 'Guild';
export const LOGO_PATH = '/logo/guild-logo.png';

/** Profiles that already exist in the codebase (site footer). Do not add others without a source. */
export const SAME_AS = ['https://github.com/LarytheLord/Adventurers-Guild', 'https://x.com/guild_india'];

/** The public marketing pages. Sitemap and llms.txt are checked against this list. */
export const PUBLIC_PAGES = [
  { path: '/', priority: 1 },
  { path: '/guides', priority: 0.8 },
  { path: '/audit', priority: 0.9 },
  { path: '/checklist', priority: 0.8 },
  { path: '/ai-risk-tier', priority: 0.9 },
  { path: '/launch-check', priority: 0.9 },
  { path: '/indic-ai-qa', priority: 0.8 },
  { path: '/guides/cert-in-ai-security-auditing-guidelines', priority: 0.9 },
  { path: '/guides/does-cert-in-require-an-ai-audit', priority: 0.7 },
  { path: '/guides/check-supabase-rls-lovable-bolt', priority: 0.7 },
  { path: '/guides/what-is-an-ai-risk-tier-cert-in', priority: 0.7 },
  { path: CHECKLIST_PATH, priority: 0.8 },
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
  const card = ogImageUrl(path);
  const image = card ?? absoluteUrl(LOGO_PATH);
  // Pages with a generated card get a 1200x630 image; others keep the square logo.
  const ogImages = card
    ? [{ url: card, width: OG_SIZE.width, height: OG_SIZE.height, alt: title }]
    : [{ url: image, width: 1254, height: 1254, alt: 'Guild logo' }];
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
      images: ogImages,
    },
    twitter: { card: card ? 'summary_large_image' : 'summary', title, description, images: [image] },
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

export function launchCheckJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Launch self-check for AI-built apps',
    url: absoluteUrl('/launch-check'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (web browser)',
    description:
      'Free 20-question self-assessment for founders who built an app with Lovable, Bolt, Replit, v0 or Cursor. Covers payments, deployment, performance and cost, and security. Runs in your browser. Not an audit.',
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

/** Article JSON-LD for the short answer pages under /guides/. Sources go in as citations. */
export function answerPageJsonLd(page: AnswerPage) {
  const pageUrl = absoluteUrl(page.path);
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    datePublished: ANSWER_PUBLISHED,
    dateModified: ANSWER_PUBLISHED,
    inLanguage: 'en-IN',
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    author: org,
    publisher: org,
    citation: page.sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.label,
      url: s.href.startsWith('/') ? absoluteUrl(s.href) : s.href,
    })),
  };
}

/** Article and Service for /indic-ai-qa. No price, offer, rating or review. */
export function indicQaJsonLd() {
  const pageUrl = absoluteUrl(INDIC_QA_PATH);
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: INDIC_QA_TITLE,
      description: INDIC_QA_DESCRIPTION,
      datePublished: INDIC_QA_PUBLISHED,
      dateModified: INDIC_QA_PUBLISHED,
      inLanguage: 'en-IN',
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      author: org,
      publisher: org,
      citation: [{ '@type': 'CreativeWork', name: INDIC_QA_CITATION.label, url: INDIC_QA_CITATION.href }],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Hindi, Gujarati and Hinglish AI quality pilot',
      serviceType: 'AI quality checks for Hindi, Gujarati and Hinglish chatbots, voice agents and LLM features',
      description: INDIC_QA_DESCRIPTION,
      url: pageUrl,
      areaServed: 'IN',
      provider: org,
    },
  ];
}

/** CollectionPage for the /guides index. Names and descriptions are the pages' own metadata. */
export function guidesHubJsonLd(entries: { name: string; description: string; path: string }[]) {
  const pageUrl = absoluteUrl('/guides');
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guides and free tools',
    url: pageUrl,
    inLanguage: 'en-IN',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.name,
        description: e.description,
        url: absoluteUrl(e.path),
      })),
    },
  };
}

/** Article JSON-LD for the evidence checklist. */
export function checklistJsonLd() {
  const pageUrl = absoluteUrl(CHECKLIST_PATH);
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: CHECKLIST_TITLE,
    description: CHECKLIST_DESCRIPTION,
    datePublished: CHECKLIST_PUBLISHED,
    dateModified: CHECKLIST_PUBLISHED,
    inLanguage: 'en-IN',
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    author: org,
    publisher: org,
  };
}
