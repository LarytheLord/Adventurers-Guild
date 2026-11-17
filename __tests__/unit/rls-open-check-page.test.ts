import { readFileSync } from 'fs';
import { join } from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sitemap from '@/app/sitemap';
import Page, { metadata } from '@/app/tools/rls-open-check/page';
import { RLS_TOOL } from '@/lib/rls-open-check-page/content';
import { GUIDE_GROUPS, allGuideItems } from '@/lib/guides-hub/registry';
import { PUBLIC_PAGES, SITE_URL } from '@/lib/seo';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);
const REPO = 'https://github.com/LarytheLord/rls-open-check';
const PATH = '/tools/rls-open-check';

const html = renderToStaticMarkup(createElement(Page));
const text = html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/&gt;/g, '>')
  .replace(/&lt;/g, '<')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');

describe('/tools/rls-open-check page', () => {
  it('renders the validation numbers from docs/VALIDATION.md', () => {
    expect(text).toContain('126 SQL files');
    expect(text).toContain('137 findings');
    expect(text).toContain('19 findings');
    expect(text).toContain('17 true positives');
    expect(text).toContain('2 unclear');
    expect(text).toContain('0 false positives');
  });

  it('renders the limits line', () => {
    expect(text).toContain('A clean result is not proof of safety');
  });

  it('links the GitHub repo, without a tracking parameter', () => {
    expect(html).toContain(`href="${REPO}"`);
    expect(html).not.toMatch(/github\.com\/LarytheLord\/rls-open-check\?/);
  });

  it('shows the demo GIF by its absolute URL, with alt text', () => {
    expect(html).toContain(
      'src="https://raw.githubusercontent.com/LarytheLord/rls-open-check/main/docs/demo.gif"',
    );
    expect(html).toMatch(/<img[^>]*alt="[^"]{20,}"/);
  });

  it('lists R1 to R9 and says what the tool is', () => {
    for (let i = 1; i <= 9; i++) expect(text).toContain(`R${i}`);
    expect(text).toContain('MIT');
    expect(text).toMatch(/no network calls/);
    expect(text).toMatch(/static/i);
  });

  it('gives the README build-from-source steps and says it is not on npm yet', () => {
    expect(html).toContain('git clone https://github.com/LarytheLord/rls-open-check.git');
    for (const cmd of ['cd rls-open-check', 'npm ci', 'npm run build', 'node dist/bin.js path/to/supabase/migrations']) {
      expect(html).toContain(cmd);
    }
    expect(text).toMatch(/not (published )?(on|to) npm yet|not published to npm yet/);
  });

  it('covers --fail-on, --strict and SARIF with README links', () => {
    expect(text).toContain('--fail-on');
    expect(text).toContain('--strict');
    expect(text).toMatch(/exit(s)? 1/);
    expect(text).toContain('SARIF');
    expect(html).toContain(`href="${REPO}#options"`);
    expect(html).toContain(`href="${REPO}#sarif-and-github-code-scanning"`);
  });

  it('links the RLS mistakes guide and /launch-check with ?src=guide', () => {
    expect(html).toContain('href="/guides/supabase-rls-mistakes-in-real-migrations?src=guide"');
    expect(html).toContain('href="/launch-check?src=guide"');
  });

  it('is plain ASCII', () => {
    expect(isAscii(html)).toBe(true);
    expect(isAscii(JSON.stringify(RLS_TOOL))).toBe(true);
    expect(isAscii(read('app/tools/rls-open-check/page.tsx'))).toBe(true);
    expect(isAscii(read('lib/rls-open-check-page/content.ts'))).toBe(true);
  });
});

describe('/tools/rls-open-check metadata and wiring', () => {
  it('has a title, a description and a canonical URL', () => {
    expect(typeof metadata.title).toBe('string');
    expect(String(metadata.title)).toMatch(/ - Guild$/);
    expect(String(metadata.description).length).toBeGreaterThan(50);
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${PATH}`);
  });

  it('is in PUBLIC_PAGES, the sitemap and llms.txt', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain(PATH);
    expect(sitemap().map((e) => e.url)).toContain(`${SITE_URL}${PATH}`);
    expect(read('public/llms.txt')).toContain(`(${SITE_URL}${PATH})`);
  });

  it('is listed on the guides hub as a free tool', () => {
    expect(allGuideItems()).toContainEqual({ path: PATH, kind: 'tool' });
    expect(GUIDE_GROUPS.find((g) => g.id === 'launching')?.items.map((i) => i.path)).toContain(PATH);
    expect(read('app/guides/page.tsx')).toContain("from '@/app/tools/rls-open-check/page'");
  });
});
