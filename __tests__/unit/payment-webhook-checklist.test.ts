import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import { PUBLIC_PAGES, SITE_URL } from '@/lib/seo';
import { allGuideItems } from '@/lib/guides-hub/registry';
import { OG_PAGES, ogSlugForPath } from '@/lib/og';
import {
  WEBHOOK_CTA_HREF,
  WEBHOOK_DESCRIPTION,
  WEBHOOK_META_TITLE,
  WEBHOOK_PATH,
  WEBHOOK_PUBLISHED,
  WEBHOOK_TITLE,
  WEBHOOK_CONTEXT,
  WEBHOOK_ITEMS,
  WEBHOOK_EXAMPLES,
  webhookPlainText,
  webhookDocsUrls,
} from '@/lib/payment-webhook-checklist/content';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

describe('payment webhook checklist content', () => {
  it('uses the required route and CTA', () => {
    expect(WEBHOOK_PATH).toBe('/guides/payment-webhook-checklist-razorpay-stripe');
    expect(WEBHOOK_CTA_HREF).toBe('/launch-check?src=guide');
  });

  it('has the six checks in order', () => {
    expect(WEBHOOK_ITEMS.map((i) => i.id)).toEqual([
      'raw-body-signature',
      'reject-unsigned-stale',
      'idempotency',
      'server-side-amounts',
      'paid-only-from-webhook',
      'test-mode-and-cli',
    ]);
  });

  it('gives every check a docs link for both providers', () => {
    for (const i of WEBHOOK_ITEMS) {
      expect(i.stripe.length).toBeGreaterThan(0);
      expect(i.razorpay.length).toBeGreaterThan(0);
    }
  });

  it('cites exactly these pages', () => {
    const urls = webhookDocsUrls().sort();
    expect(urls).toEqual(
      [
        'https://docs.stripe.com/webhooks',
        'https://docs.stripe.com/webhooks/signature',
        'https://docs.stripe.com/checkout/fulfillment',
        'https://docs.stripe.com/stripe-cli',
        'https://docs.stripe.com/testing',
        'https://razorpay.com/docs/webhooks/',
        'https://razorpay.com/docs/webhooks/validate-test/',
        'https://razorpay.com/docs/payments/orders/',
        'https://razorpay.com/docs/payments/payments/test-card-details/',
        'https://razorpay.com/docs/payments/payments/test-card-upi-details/',
      ].sort(),
    );
    expect(urls.join('\n')).not.toContain('payment-gateway/test-card-details');
  });

  it('shows one raw-body route handler per provider, 40 lines or fewer', () => {
    expect(WEBHOOK_EXAMPLES.map((e) => e.provider)).toEqual(['Stripe', 'Razorpay']);
    const [stripe, razorpay] = WEBHOOK_EXAMPLES.map((e) => e.code);
    expect(stripe).toContain('await req.text()');
    expect(stripe).toContain('constructEvent');
    expect(razorpay).toContain('await req.text()');
    expect(razorpay).toContain('validateWebhookSignature');
    expect(razorpay).toContain('x-razorpay-signature');
    expect(razorpay).toContain('x-razorpay-event-id');
    expect(razorpay).not.toContain('req.json()');
    for (const e of WEBHOOK_EXAMPLES) expect(e.code.split('\n').length).toBeLessThanOrEqual(40);
  });

  it('does not contain these phrases', () => {
    const t = webhookPlainText();
    expect(t).not.toMatch(/Razorpay does not/i);
    expect(t).not.toMatch(/created_at/);
    expect(t).not.toMatch(/5 minute/i);
  });

  it('is ASCII, gives the manual-check advice, and has no percentages or scanner claims', () => {
    expect(isAscii(webhookPlainText())).toBe(true);
    expect(WEBHOOK_CONTEXT).toMatch(/^We suggest/);
    expect(webhookPlainText()).not.toMatch(/scanner/i);
    expect(webhookPlainText()).not.toMatch(/six free|private test/i);
    expect(webhookPlainText()).not.toMatch(/\d+(\.\d+)?\s?%/);
    expect(webhookPlainText()).toContain(WEBHOOK_CTA_HREF);
  });

  it('every internal link in the page source and content resolves to a page under app/', () => {
    const fromText = [...webhookPlainText().matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1]);
    const fromSource = [...read(`app${WEBHOOK_PATH}/page.tsx`).matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
    const hrefs = [...fromText, ...fromSource, WEBHOOK_CTA_HREF].map((h) => h.split('?')[0]);
    expect(hrefs).toContain('/launch-check');
    expect(hrefs).toContain('/checklist');
    for (const p of hrefs) expect(existsSync(join(root, `app${p}/page.tsx`))).toBe(true);
  });

  it('item 2 heading does not promise a stale check for Razorpay', () => {
    const h = WEBHOOK_ITEMS.find((i) => i.id === 'reject-unsigned-stale')!.heading;
    expect(h).toBe('2. Reject unsigned events; limit replays');
    expect(WEBHOOK_DESCRIPTION).not.toMatch(/stale/i);
  });

  it('keeps meta title and description within search result length', () => {
    expect(`${WEBHOOK_META_TITLE} - Guild`.length).toBeLessThanOrEqual(60);
    expect(WEBHOOK_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it('derives the visible updated date from WEBHOOK_PUBLISHED', () => {
    const src = read(`app${WEBHOOK_PATH}/page.tsx`);
    expect(src).not.toMatch(/updatedAt="/);
    expect(src).toContain('updatedAt={');
    expect(WEBHOOK_PUBLISHED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('page and wiring', () => {
  it('has a page that uses buildPageMetadata and links the CTA', () => {
    const f = `app${WEBHOOK_PATH}/page.tsx`;
    expect(existsSync(join(root, f))).toBe(true);
    const src = read(f);
    expect(src).toMatch(/export const metadata/);
    expect(src).toContain('buildPageMetadata');
    expect(src).toContain('path: WEBHOOK_PATH');
    expect(src).toContain('WEBHOOK_CTA_HREF');
    expect(isAscii(src)).toBe(true);
  });

  it('is in PUBLIC_PAGES, the sitemap, the hub, the og registry and llms.txt', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain(WEBHOOK_PATH);
    expect(sitemap().map((e) => e.url)).toContain(`${SITE_URL}${WEBHOOK_PATH}`);
    expect(allGuideItems().map((i) => i.path)).toContain(WEBHOOK_PATH);
    expect(read('app/guides/page.tsx')).toContain(`from '@/app${WEBHOOK_PATH}/page'`);
    expect(OG_PAGES[ogSlugForPath(WEBHOOK_PATH) as string].title).toBe(WEBHOOK_TITLE);
    const txt = read('public/llms.txt');
    expect(txt).toContain(`(${SITE_URL}${WEBHOOK_PATH})`);
    expect(isAscii(txt)).toBe(true);
  });
});
