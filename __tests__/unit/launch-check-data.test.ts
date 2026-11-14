import { readFileSync } from 'fs';
import { join } from 'path';
import {
  LAUNCH_ANSWERS,
  LAUNCH_AREAS,
  LAUNCH_QUESTIONS,
  checklistHref,
  findGaps,
  isComplete,
  scoreByArea,
  slugify,
  type AnswerValue,
  type Answers,
} from '@/lib/launch-check/data';
import { CHECKLIST_GROUPS } from '@/lib/audit-offer/content';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

function answerAll(value: AnswerValue): Answers {
  return Object.fromEntries(LAUNCH_QUESTIONS.map((q) => [q.id, value]));
}

describe('launch check data', () => {
  it('has four areas with five questions each, 20 in total, with unique ids', () => {
    expect(LAUNCH_AREAS.map((a) => a.id)).toEqual(['payments', 'deployment', 'performance', 'security']);
    expect(LAUNCH_QUESTIONS).toHaveLength(20);
    expect(new Set(LAUNCH_QUESTIONS.map((q) => q.id)).size).toBe(20);
    for (const a of LAUNCH_AREAS) {
      expect(LAUNCH_QUESTIONS.filter((q) => q.area === a.id)).toHaveLength(5);
    }
  });

  it('every question has text, a one-line fix, and a checklist target that exists', () => {
    const groupIds = CHECKLIST_GROUPS.map((g) => g.id);
    const checks = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.check));
    for (const q of LAUNCH_QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(20);
      expect(q.fix.length).toBeGreaterThan(20);
      expect(q.fix).not.toMatch(/\n/);
      expect(groupIds).toContain(q.checklistGroup);
      if (q.checklistCheck) {
        const group = CHECKLIST_GROUPS.find((g) => g.id === q.checklistGroup)!;
        expect(group.items.map((i) => i.check)).toContain(q.checklistCheck);
        expect(checks).toContain(q.checklistCheck);
      }
    }
  });

  it('every question is linked to an exact checklist item (none fall back to a group)', () => {
    for (const q of LAUNCH_QUESTIONS) expect(q.checklistCheck).toBeTruthy();
  });

  it('relinks the questions to the items added with the Launch Check rename', () => {
    const byId = (id: string) => LAUNCH_QUESTIONS.find((q) => q.id === id)!;
    expect([byId('dep-env-vars').checklistGroup, byId('dep-env-vars').checklistCheck]).toEqual([
      'deployment',
      'Every environment variable is set on the production host, and the app fails loudly when one is missing.',
    ]);
    expect([byId('dep-domain').checklistGroup, byId('dep-domain').checklistCheck]).toEqual([
      'deployment',
      'Your custom domain uses HTTPS, and the login, payment and webhook URLs point to it, not a preview address.',
    ]);
    expect(byId('perf-bill-10k').checklistCheck).toContain('10,000 visits');
    expect(byId('pay-webhook-retries').checklistGroup).toBe('payments');
    expect(byId('pay-refunds').checklistGroup).toBe('payments');
    expect(byId('perf-indexes').checklistGroup).toBe('performance');
    expect(byId('perf-images').checklistGroup).toBe('performance');
  });

  it('each linked item shares a keyword with its question', () => {
    const STOP = new Set(['your', 'that', 'with', 'from', 'have', 'does', 'they', 'them', 'this', 'what', 'when', 'into', 'than', 'were', 'will', 'been', 'each', 'every', 'only', 'not', 'the', 'and', 'for', 'are']);
    const words = (t: string) =>
      new Set(
        t
          .toLowerCase()
          .replace(/(\d),(\d)/g, '$1$2')
          .match(/[a-z0-9]+/g)!
          .filter((w) => w.length >= 4 && !STOP.has(w))
          .map((w) => w.replace(/s$/, '')),
      );
    for (const q of LAUNCH_QUESTIONS) {
      const qw = words(q.text);
      const shared = [...words(q.checklistCheck!)].filter((w) => qw.has(w));
      expect({ id: q.id, shared: shared.length > 0 }).toEqual({ id: q.id, shared: true });
    }
  });

  it('is named "Launch self-check" so it does not collide with the paid Launch Check', () => {
    const footer = read('components/ui/footer-taped-design.tsx');
    expect(footer).toContain('href="/launch-check">Launch self-check</Link>');
    expect(footer).toContain('href="/audit">Launch Check</Link>');
    expect(read('app/launch-check/page.tsx')).toContain("const TITLE = 'Launch self-check");
    expect(read('lib/seo.ts')).toContain("name: 'Launch self-check");
    expect(read('public/llms.txt')).toContain('[Launch self-check](https://www.guilds.work/launch-check)');
    expect(read('public/llms.txt')).toContain('[Launch Check](https://www.guilds.work/audit)');
  });

  it('covers the topics the page promises', () => {
    const all = LAUNCH_QUESTIONS.map((q) => q.text.toLowerCase()).join(' | ');
    for (const term of [
      'webhook',
      'refund',
      'live',
      'environment variable',
      'domain',
      'spf',
      'backup',
      'index',
      'image',
      '10,000',
      'row level security',
      'secret',
      'login',
    ]) {
      expect(all).toContain(term);
    }
  });

  it('scores each area as the number of yes answers out of five', () => {
    expect(scoreByArea({}).map((s) => [s.area, s.yes, s.total, s.answered])).toEqual([
      ['payments', 0, 5, 0],
      ['deployment', 0, 5, 0],
      ['performance', 0, 5, 0],
      ['security', 0, 5, 0],
    ]);
    const all = scoreByArea(answerAll('yes'));
    for (const s of all) expect([s.yes, s.answered, s.total]).toEqual([5, 5, 5]);
    const payments = LAUNCH_QUESTIONS.filter((q) => q.area === 'payments');
    const mixed: Answers = {
      [payments[0].id]: 'yes',
      [payments[1].id]: 'yes',
      [payments[2].id]: 'no',
      [payments[3].id]: 'unsure',
    };
    const p = scoreByArea(mixed)[0];
    expect([p.yes, p.answered]).toEqual([2, 4]);
  });

  it('findGaps lists every non-yes answer in question order, and never a yes', () => {
    expect(findGaps(answerAll('yes'))).toEqual([]);
    expect(findGaps({})).toEqual([]);
    expect(findGaps(answerAll('no'))).toHaveLength(20);
    const a: Answers = { ...answerAll('yes'), [LAUNCH_QUESTIONS[3].id]: 'unsure', [LAUNCH_QUESTIONS[1].id]: 'no' };
    expect(findGaps(a).map((q) => q.id)).toEqual([LAUNCH_QUESTIONS[1].id, LAUNCH_QUESTIONS[3].id]);
  });

  it('isComplete needs all 20 answers, each a known value', () => {
    expect(isComplete({})).toBe(false);
    expect(isComplete(answerAll('yes'))).toBe(true);
    expect(isComplete({ ...answerAll('yes'), [LAUNCH_QUESTIONS[0].id]: 'bogus' as AnswerValue })).toBe(false);
    expect(LAUNCH_ANSWERS.map((a) => a.value)).toEqual(['yes', 'unsure', 'no']);
  });

  it('checklist links go to the /checklist page with an anchor that the page can resolve', () => {
    for (const q of LAUNCH_QUESTIONS) {
      const href = checklistHref(q);
      expect(href.startsWith('/checklist#')).toBe(true);
      const anchor = href.split('#')[1];
      if (q.checklistCheck) expect(anchor).toBe(slugify(q.checklistCheck));
      else expect(anchor).toBe(`g-${q.checklistGroup}`);
    }
    // anchors on the checklist page must be unique
    const slugs = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => slugify(i.check)));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(read('app/checklist/page.tsx')).toContain('slugify(item.check)');
  });

  it('is plain ASCII and makes no numeric claims beyond the questions themselves', () => {
    const all = JSON.stringify({ LAUNCH_AREAS, LAUNCH_QUESTIONS, LAUNCH_ANSWERS });
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(all)).toBe(true);
    expect(all).not.toMatch(/\d+\s*%/);
    expect(all).not.toMatch(/\b(most|majority|studies show|according to)\b/i);
    expect(all).not.toMatch(/empanelled/i);
  });

  it('page file: ASCII, builder metadata, WebApplication JSON-LD, links /checklist, says it is not an audit', () => {
    const page = read('app/launch-check/page.tsx');
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(page)).toBe(true);
    expect(page).toContain("path: '/launch-check'");
    expect(page).toContain('launchCheckJsonLd()');
    expect(page).toContain('<RequestLaunchCheck');
    expect(page).not.toContain('get-started');
    expect(page).toMatch(/not an audit/i);
    expect(page).toMatch(/not a CERT-In empanelled auditor/);
    const calc = read('components/launch-check/launch-check-quiz.tsx');
    expect(calc).toContain('href="/audit"');
    expect(calc).toContain('checklistHref');
  });
});
