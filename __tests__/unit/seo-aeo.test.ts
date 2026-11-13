import { readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import {
  AI_CRAWLERS,
  PUBLIC_PAGES,
  SAME_AS,
  SITE_URL,
  buildPageMetadata,
  explainerJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  softwareApplicationJsonLd,
  launchCheckJsonLd,
} from '@/lib/seo';
import { ANSWER_PAGES } from '@/lib/answer-pages/content';
import { explainerPlainText, EXPLAINER_FAQ, stripLinks } from '@/lib/cert-in-explainer/content';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

const PAGE_FILES: Record<string, string> = {
  '/': 'app/page.tsx',
  '/audit': 'app/audit/page.tsx',
  '/checklist': 'app/checklist/page.tsx',
  '/ai-risk-tier': 'app/ai-risk-tier/page.tsx',
  '/launch-check': 'app/launch-check/page.tsx',
  '/guides/cert-in-ai-security-auditing-guidelines': 'app/guides/cert-in-ai-security-auditing-guidelines/page.tsx',
  ...Object.fromEntries(ANSWER_PAGES.map((a) => [a.path, `app${a.path}/page.tsx`])),
};

describe('sitemap', () => {
  const urls = sitemap().map((e) => e.url);

  it('lists exactly the nine public pages on www.guilds.work', () => {
    expect(urls.sort()).toEqual(
      [
        'https://www.guilds.work/',
        'https://www.guilds.work/audit',
        'https://www.guilds.work/checklist',
        'https://www.guilds.work/ai-risk-tier',
        'https://www.guilds.work/launch-check',
        'https://www.guilds.work/guides/cert-in-ai-security-auditing-guidelines',
        'https://www.guilds.work/guides/does-cert-in-require-an-ai-audit',
        'https://www.guilds.work/guides/check-supabase-rls-lovable-bolt',
        'https://www.guilds.work/guides/what-is-an-ai-risk-tier-cert-in',
      ].sort(),
    );
  });

  it('excludes dashboard, admin, api and auth routes', () => {
    for (const u of urls) {
      expect(u).not.toMatch(/\/(dashboard|admin|api|login|register|forgot-password|reset-password|adventurer|company|quests)(\/|$)/);
      expect(u.startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });
});

describe('robots', () => {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];

  it('allows each major AI crawler on public pages', () => {
    const agents = rules.flatMap((x) => (Array.isArray(x.userAgent) ? x.userAgent : [x.userAgent]));
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended']) {
      expect(AI_CRAWLERS).toContain(bot);
      expect(agents).toContain(bot);
    }
    for (const rule of rules) expect(rule.allow).toBe('/');
  });

  it('disallows private routes for every rule', () => {
    for (const rule of rules) {
      const dis = ([] as string[]).concat(rule.disallow ?? []);
      for (const p of ['/api/', '/admin/', '/dashboard/', '/login']) expect(dis).toContain(p);
    }
  });

  it('points at the sitemap on the canonical host', () => {
    expect(r.sitemap).toBe('https://www.guilds.work/sitemap.xml');
  });
});

describe('llms.txt', () => {
  const txt = read('public/llms.txt');
  it('is ASCII and links every public page', () => {
    expect(isAscii(txt)).toBe(true);
    for (const p of PUBLIC_PAGES) {
      expect(txt).toContain(p.path === '/' ? '(https://www.guilds.work/)' : `(https://www.guilds.work${p.path})`);
    }
  });
  it('does not claim empanelment', () => {
    expect(txt).toMatch(/not a CERT-In empanelled auditor/);
  });
});

describe('JSON-LD', () => {
  it('Organization parses, uses only sameAs profiles that exist in the codebase', () => {
    const o = JSON.parse(serializeJsonLd(organizationJsonLd()));
    expect(o['@type']).toBe('Organization');
    expect(o.name).toBe('Guild');
    expect(o.url).toBe(SITE_URL);
    expect(o.sameAs).toEqual(SAME_AS);
    const footer = read('components/ui/footer-taped-design.tsx');
    for (const u of o.sameAs as string[]) expect(footer).toContain(u);
  });

  it('logo file exists', () => {
    expect(() => readFileSync(join(root, 'public/logo/guild-logo.png'))).not.toThrow();
  });

  it('WebApplication parses and is free', () => {
    const a = JSON.parse(serializeJsonLd(softwareApplicationJsonLd()));
    expect(a['@type']).toBe('WebApplication');
    expect(a.url).toBe('https://www.guilds.work/ai-risk-tier');
  });

  it('launch check WebApplication parses, is free and points at /launch-check', () => {
    const a = JSON.parse(serializeJsonLd(launchCheckJsonLd()));
    expect(a['@context']).toBe('https://schema.org');
    expect(a['@type']).toBe('WebApplication');
    expect(a.url).toBe('https://www.guilds.work/launch-check');
    expect(a.offers.price).toBe('0');
    expect(a.name).not.toBe(JSON.parse(serializeJsonLd(softwareApplicationJsonLd())).name);
    expect(a.description).toMatch(/not an audit/i);
  });

  it('FAQPage answers are substrings of the guide content', () => {
    const [article, faq] = JSON.parse(serializeJsonLd(explainerJsonLd()));
    expect(article['@type']).toBe('Article');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(EXPLAINER_FAQ.length);
    const text = explainerPlainText();
    for (const q of faq.mainEntity) {
      expect(text).toContain(q.name);
      expect(text).toContain(q.acceptedAnswer.text);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(20);
    }
    expect(stripLinks('[a](/b)')).toBe('a (/b)');
  });

  it('serialisation cannot close the script tag', () => {
    expect(serializeJsonLd({ x: '</script><b>' })).not.toContain('</script>');
    expect(JSON.parse(serializeJsonLd({ x: '</script>' })).x).toBe('</script>');
  });
});

describe('page metadata', () => {
  it('builder pins canonical and OG url, adds twitter card', () => {
    const m = buildPageMetadata({ path: '/audit', title: 'T', description: 'D' });
    expect(m.alternates?.canonical).toBe('https://www.guilds.work/audit');
    expect((m.openGraph as { url: string }).url).toBe('https://www.guilds.work/audit');
    expect((m.twitter as { card: string }).card).toBe('summary_large_image');
  });

  it('each public page uses the builder with its own path, ASCII only, and no stray numbers', () => {
    for (const p of PUBLIC_PAGES) {
      const src = read(PAGE_FILES[p.path]);
      expect(src).toContain('buildPageMetadata');
      expect(src).toContain(p.path === '/' ? "path: '/'" : p.path === '/guides/cert-in-ai-security-auditing-guidelines' ? 'path: EXPLAINER_PATH' : ANSWER_PAGES.some((a) => a.path === p.path) ? 'path: PAGE.path' : `path: '${p.path}'`);
      expect(isAscii(src)).toBe(true);
    }
    const auditMeta = read('app/audit/page.tsx').split('export const metadata')[0];
    // "v0" is a product name, not a figure
    expect(auditMeta.replace(/\bv0\b/g, '')).not.toMatch(/\d/);
    const checklistMeta = read('app/checklist/page.tsx').split('export const metadata')[0];
    expect(checklistMeta).not.toMatch(/\d/);
  });

  it('titles and descriptions are unique', () => {
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const p of PUBLIC_PAGES) {
      const src = read(PAGE_FILES[p.path]);
      const t = src.match(/const TITLE = '([^']+)'/)?.[1] ?? (p.path === '/' ? 'HOME' : ANSWER_PAGES.some((a) => a.path === p.path) ? p.path : 'EXPLAINER');
      titles.add(t);
      const d = src.match(/const DESCRIPTION =\s*'([^']+)'/)?.[1] ?? p.path;
      descs.add(d);
    }
    expect(titles.size).toBe(PUBLIC_PAGES.length);
    expect(descs.size).toBe(PUBLIC_PAGES.length);
  });
});
