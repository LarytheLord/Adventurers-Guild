import { readFileSync } from 'fs';
import { join } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sitemap from '@/app/sitemap';
import { AnswerPageView } from '@/components/guides/answer-page';
import { ANSWER_PAGES, answerPagePlainText } from '@/lib/answer-pages/content';
import { allGuideItems } from '@/lib/guides-hub/registry';
import { PUBLIC_PAGES, answerPageFaqJsonLd, serializeJsonLd } from '@/lib/seo';

const PATH = '/guides/leaked-supabase-key-what-to-do-first';
const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const page = () => ANSWER_PAGES.find((p) => p.path === PATH)!;

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

describe('leaked Supabase key guide', () => {
  it('exists as an answer page and a route file', () => {
    expect(page()).toBeDefined();
    expect(read(`app${PATH}/page.tsx`)).toContain('AnswerPageView');
  });

  it('renders its answer and every section heading', () => {
    const html = renderToStaticMarkup(createElement(AnswerPageView, { page: page() }));
    expect(html).toContain('The short answer');
    for (const s of page().sections) expect(html).toContain(s.heading);
    expect(html).toContain('Sources');
    expect(page().sections.map((s) => s.heading).join('|')).toMatch(
      /Which key leaked.*Rotate.*logs.*policies.*git history.*human check/i,
    );
  });

  it('every external link is to supabase.com or github.com', () => {
    const html = renderToStaticMarkup(createElement(AnswerPageView, { page: page() }));
    const external = hrefs(html).filter((h) => /^https?:\/\//.test(h));
    expect(external.length).toBeGreaterThan(0);
    for (const h of external) {
      const host = new URL(h).hostname;
      expect(/^(.+\.)?(supabase\.com|github\.com)$/.test(host)).toBe(true);
    }
  });

  it('every external href in the body is listed in sources', () => {
    const html = renderToStaticMarkup(createElement(AnswerPageView, { page: page() }));
    const sources = new Set(page().sources.map((s) => s.href));
    const external = hrefs(html).filter((h) => /^https?:\/\//.test(h) && !h.startsWith('https://www.guilds.work'));
    expect(external.length).toBeGreaterThan(0);
    for (const h of external) expect(sources.has(h)).toBe(true);
  });

  it('links the internal pages the brief names', () => {
    const links = hrefs(renderToStaticMarkup(createElement(AnswerPageView, { page: page() })));
    for (const h of ['/tools/rls-open-check', '/guides/supabase-rls-mistakes-in-real-migrations?src=guide', '/launch-check?src=guide']) {
      expect(links).toContain(h);
    }
  });

  it('links the rotate-leaked-api-keys page from the rotate step and sources', () => {
    const ROTATE = 'https://supabase.com/docs/guides/security/rotate-leaked-api-keys';
    const rotate = page().sections.find((s) => s.id === 'rotate')!;
    expect(JSON.stringify(rotate)).toContain(ROTATE);
    expect(page().sources.map((s) => s.href)).toContain(ROTATE);
  });

  it('names new-style key prefixes next to the legacy key names', () => {
    const text = answerPagePlainText(page());
    for (const t of ['sb_publishable_', 'sb_secret_', 'anon', 'service_role']) expect(text).toContain(t);
  });

  it('cites the API keys page for the legacy-keys line, not the rotate page', () => {
    const API_KEYS = 'https://supabase.com/docs/guides/api/api-keys';
    const rotate = page().sections.find((s) => s.id === 'rotate')!;
    const para = rotate.blocks.map((b) => (b.kind === 'p' ? b.text : '')).find((t) => /stay valid until you disable them/.test(t))!;
    expect(para).toContain(`(${API_KEYS})`);
    expect(para).toContain('Settings > API Keys section of the Dashboard');
    expect(para).not.toMatch(/rotate-leaked-api-keys\)[^.]*stay valid/);
  });

  it('has no invented number in the title, description or answer', () => {
    const p = page();
    for (const t of [p.title, p.description, p.answer]) expect(t).not.toMatch(/\b\d+\s*(minutes?|hours?|mins?)\b/i);
    expect(p.title).toBe('Leaked a Supabase key? What to do first');
    expect(read('public/llms.txt')).not.toMatch(/30[ -]minutes/i);
    expect(p.path).not.toMatch(/\d+-minutes?/);
  });

  it('says the step order applies to a leaked service_role key', () => {
    expect(page().answer).toMatch(/If a service_role key leaked.*in order/);
  });

  it('has FAQ structured data that matches the visible FAQ', () => {
    const p = page();
    expect(p.faq!.length).toBeGreaterThanOrEqual(3);
    const ld = JSON.parse(serializeJsonLd(answerPageFaqJsonLd(p)));
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(p.faq!.map((f) => f.q));
    for (const q of ld.mainEntity as { acceptedAnswer: { text: string } }[]) {
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(20);
      expect(q.acceptedAnswer.text).not.toContain('](');
      expect(q.acceptedAnswer.text).not.toMatch(/https?:/);
    }
    const html = renderToStaticMarkup(createElement(AnswerPageView, { page: p }));
    expect(html).toContain('application/ld+json');
    expect(html).toContain('FAQPage');
  });

  it('is plain ASCII, under 700 words, and puts the key distinction in the first answer', () => {
    const text = answerPagePlainText(page());
    expect(/^[\x00-\x7F]*$/.test(text)).toBe(true);
    expect(/^[\x00-\x7F]*$/.test(page().title + page().description)).toBe(true);
    expect(text.split(/\s+/).filter(Boolean).length).toBeLessThan(700);
    expect(page().answer).toMatch(/anon/);
    expect(page().answer).toMatch(/service_role/);
    expect(page().answer).toMatch(/RLS|Row Level Security/);
  });

  it('is in the hub, sitemap and llms.txt', () => {
    expect(allGuideItems().map((i) => i.path)).toContain(PATH);
    expect(read('app/guides/page.tsx')).toContain(`from '@/app${PATH}/page'`);
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain(PATH);
    expect(sitemap().map((e) => e.url)).toContain(`https://www.guilds.work${PATH}`);
    expect(read('public/llms.txt')).toContain(`(https://www.guilds.work${PATH})`);
  });
});
