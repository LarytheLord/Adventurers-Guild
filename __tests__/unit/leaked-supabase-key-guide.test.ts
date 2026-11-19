import { readFileSync } from 'fs';
import { join } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sitemap from '@/app/sitemap';
import { AnswerPageView } from '@/components/guides/answer-page';
import { ANSWER_PAGES, answerPagePlainText } from '@/lib/answer-pages/content';
import { allGuideItems } from '@/lib/guides-hub/registry';
import { PUBLIC_PAGES, answerPageFaqJsonLd, serializeJsonLd } from '@/lib/seo';

const PATH = '/guides/leaked-supabase-key-first-30-minutes';
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

  it('links the internal pages the brief names', () => {
    const links = hrefs(renderToStaticMarkup(createElement(AnswerPageView, { page: page() })));
    for (const h of ['/tools/rls-open-check', '/guides/supabase-rls-mistakes-in-real-migrations?src=guide', '/launch-check?src=guide']) {
      expect(links).toContain(h);
    }
  });

  it('has FAQ structured data that matches the visible FAQ', () => {
    const p = page();
    expect(p.faq!.length).toBeGreaterThanOrEqual(3);
    const ld = JSON.parse(serializeJsonLd(answerPageFaqJsonLd(p)));
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(p.faq!.map((f) => f.q));
    const html = renderToStaticMarkup(createElement(AnswerPageView, { page: p }));
    expect(html).toContain('application/ld+json');
    expect(html).toContain('FAQPage');
  });

  it('is plain ASCII, under 700 words, and puts the key distinction in the first answer', () => {
    const text = answerPagePlainText(page());
    expect(/^[\x00-\x7F]*$/.test(text)).toBe(true);
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
