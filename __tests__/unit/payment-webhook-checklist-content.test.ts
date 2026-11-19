import fs from 'fs';
import path from 'path';
import {
  CHECKLIST_PATH,
  CHECKLIST_TITLE,
  CHECKLIST_CONTEXT,
  CHECKLIST_ITEMS,
  CHECKLIST_EXAMPLES,
  LAUNCH_CHECK_HREF,
  checklistPlainText,
  allDocsUrls,
} from '@/lib/payment-webhook-checklist/content';
import { GUIDES } from '@/lib/guides';
import sitemap from '@/app/sitemap';

const root = path.join(__dirname, '..', '..');

describe('payment webhook checklist guide', () => {
  it('is pure ASCII', () => {
    const all = JSON.stringify({ CHECKLIST_TITLE, CHECKLIST_CONTEXT, CHECKLIST_ITEMS, CHECKLIST_EXAMPLES });
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(all)).toBe(true);
  });

  it('covers the six required checks in order', () => {
    expect(CHECKLIST_ITEMS.map((i) => i.id)).toEqual([
      'raw-body-signature',
      'reject-unsigned-stale',
      'idempotency',
      'server-side-amounts',
      'paid-only-from-webhook',
      'test-mode-and-cli',
    ]);
  });

  it('gives every item at least one official docs url per provider claim', () => {
    for (const item of CHECKLIST_ITEMS) {
      expect(item.stripe.length + item.razorpay.length).toBeGreaterThan(0);
      for (const s of item.stripe) expect(s.url.startsWith('https://docs.stripe.com/')).toBe(true);
      for (const r of item.razorpay) expect(r.url.startsWith('https://razorpay.com/docs/')).toBe(true);
    }
  });

  it('only cites docs.stripe.com and razorpay.com/docs', () => {
    const urls = allDocsUrls();
    expect(urls.length).toBeGreaterThanOrEqual(8);
    for (const u of urls) {
      expect(/^https:\/\/(docs\.stripe\.com|razorpay\.com\/docs)\//.test(u)).toBe(true);
    }
  });

  it('shows one route handler per provider that reads the raw body and verifies', () => {
    expect(CHECKLIST_EXAMPLES.map((e) => e.provider)).toEqual(['Stripe', 'Razorpay']);
    const stripe = CHECKLIST_EXAMPLES[0].code;
    const razorpay = CHECKLIST_EXAMPLES[1].code;
    expect(stripe).toContain('await req.text()');
    expect(stripe).toContain('constructEvent');
    expect(stripe).toContain('stripe-signature');
    expect(razorpay).toContain('await req.text()');
    expect(razorpay).toContain('validateWebhookSignature');
    expect(razorpay).toContain('x-razorpay-signature');
    expect(razorpay).not.toContain('req.json()');
    for (const e of CHECKLIST_EXAMPLES) expect(e.code.split('\n').length).toBeLessThanOrEqual(40);
  });

  it('links to the launch check with the guide source tag', () => {
    expect(LAUNCH_CHECK_HREF).toBe('/launch-check?src=guide');
    expect(checklistPlainText()).toContain('/launch-check?src=guide');
  });

  it('states the context line without numbers beyond the ones given', () => {
    expect(CHECKLIST_CONTEXT).toContain('none of six free static scanners');
    expect(CHECKLIST_CONTEXT).toContain('signature');
    expect(CHECKLIST_CONTEXT).toContain('same event twice');
  });

  it('is registered in the hub, sitemap and llms.txt', () => {
    expect(CHECKLIST_PATH).toBe('/guides/payment-webhook-checklist-razorpay-stripe');
    expect(GUIDES.map((g) => g.path)).toContain(CHECKLIST_PATH);
    expect(GUIDES.map((g) => g.path)).toContain('/guides/cert-in-ai-security-auditing-guidelines');
    expect(sitemap().map((s) => s.url)).toContain(`https://www.guilds.work${CHECKLIST_PATH}`);
    expect(sitemap().map((s) => s.url)).toContain('https://www.guilds.work/guides');
    const llms = fs.readFileSync(path.join(root, 'public', 'llms.txt'), 'utf8');
    expect(llms).toContain(`https://www.guilds.work${CHECKLIST_PATH}`);
  });
});
