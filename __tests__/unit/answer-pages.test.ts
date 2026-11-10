import { readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import { ANSWER_PAGES, answerPagePlainText } from '@/lib/answer-pages/content';
import { CERTIN_PDF_URL } from '@/lib/cert-in-explainer/content';
import { PUBLIC_PAGES, answerPageJsonLd, serializeJsonLd } from '@/lib/seo';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const byPath = (p: string) => ANSWER_PAGES.find((x) => x.path === p)!;

const CERT_PATH = '/guides/does-cert-in-require-an-ai-audit';
const RLS_PATH = '/guides/check-supabase-rls-lovable-bolt';
const TIER_PATH = '/guides/what-is-an-ai-risk-tier-cert-in';

describe('answer pages content', () => {
  it('has the three requested pages under /guides/', () => {
    expect(ANSWER_PAGES.map((p) => p.path).sort()).toEqual([CERT_PATH, RLS_PATH, TIER_PATH].sort());
    expect(byPath(CERT_PATH).title).toBe('Does CERT-In require an AI audit?');
    expect(byPath(RLS_PATH).title).toBe('How to check Supabase RLS on an app built with Lovable or Bolt');
    expect(byPath(TIER_PATH).title).toBe('What is an AI risk tier under CERT-In?');
  });

  it.each(ANSWER_PAGES.map((p) => [p.path, p] as const))('%s: two-sentence answer, sources, ASCII, under 700 words', (_path, page) => {
    const sentences = page.answer.split(/(?<=[.!?])\s+/).filter(Boolean);
    expect(sentences).toHaveLength(2);
    expect(page.sources.length).toBeGreaterThanOrEqual(1);
    for (const s of page.sources) expect(s.href).toMatch(/^(https:\/\/|\/)/);
    const text = answerPagePlainText(page);
    expect(isAscii(text)).toBe(true);
    expect(isAscii(JSON.stringify(page))).toBe(true);
    expect(words(text)).toBeLessThan(700);
  });

  it('never claims Guild is an auditor, and says it is not empanelled', () => {
    for (const page of ANSWER_PAGES) {
      const text = answerPagePlainText(page);
      expect(text).toContain('Guild is not a CERT-In empanelled auditor');
      expect(text).not.toMatch(/Guild is (a|an) (CERT-In )?(empanelled )?auditor/i);
      expect(text).not.toMatch(/we (will )?audit you/i);
    }
  });

  it('CERT-In page answers from the PDF only and says no effective date or penalty is stated in v1.0', () => {
    const page = byPath(CERT_PATH);
    expect(page.sources.map((s) => s.href)).toEqual([CERTIN_PDF_URL]);
    const text = answerPagePlainText(page);
    expect(text).toMatch(/no effective date/);
    expect(text).toMatch(/no penalty/);
    expect(page.answer).toMatch(/no effective date and no penalty/);
  });

  it('Supabase page covers the dashboard, the anon key on your own project, and warns off other projects', () => {
    const text = answerPagePlainText(byPath(RLS_PATH));
    expect(text).toMatch(/Policies/);
    expect(text).toMatch(/anon key/);
    expect(text).toMatch(/your own project/i);
    expect(text).toMatch(/service_role/);
    expect(text).toMatch(/never .*someone else/i);
  });

  it('tier page links to /ai-risk-tier and lists all four tiers', () => {
    const page = byPath(TIER_PATH);
    const text = answerPagePlainText(page);
    expect(text).toContain('(/ai-risk-tier)');
    for (const t of ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']) expect(text).toContain(t);
  });
});

describe('answer pages JSON-LD, sitemap and routes', () => {
  it.each(ANSWER_PAGES.map((p) => [p.path, p] as const))('%s: Article JSON-LD parses and points at the page', (_path, page) => {
    const a = JSON.parse(serializeJsonLd(answerPageJsonLd(page)));
    expect(a['@context']).toBe('https://schema.org');
    expect(a['@type']).toBe('Article');
    expect(a.headline).toBe(page.title);
    expect(a.url).toBe(`https://www.guilds.work${page.path}`);
    expect(a.mainEntityOfPage).toBe(a.url);
    expect(a.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a.citation.length).toBe(page.sources.length);
    for (const c of a.citation as { url: string }[]) expect(c.url).toMatch(/^https:\/\//);
  });

  it('each page is in PUBLIC_PAGES and in the sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    for (const page of ANSWER_PAGES) {
      expect(PUBLIC_PAGES.map((p) => p.path)).toContain(page.path);
      expect(urls).toContain(`https://www.guilds.work${page.path}`);
    }
  });

  it('each route file renders the shared view with Article JSON-LD and pinned metadata', () => {
    for (const page of ANSWER_PAGES) {
      const src = read(`app${page.path}/page.tsx`);
      expect(src).toContain('buildPageMetadata');
      expect(src).toContain('AnswerPageView');
      expect(isAscii(src)).toBe(true);
    }
    expect(read('components/guides/answer-page.tsx')).toContain('answerPageJsonLd');
  });

  it('llms.txt lists each page', () => {
    const txt = read('public/llms.txt');
    for (const page of ANSWER_PAGES) expect(txt).toContain(`(https://www.guilds.work${page.path})`);
  });
});
