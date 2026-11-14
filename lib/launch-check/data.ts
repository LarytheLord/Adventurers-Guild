// Content and scoring for /launch-check: a 20-question self-assessment for founders
// who built an app with an AI app builder (Lovable, Bolt, Replit, v0, Cursor).
// Pure data and pure functions so it can be unit tested. No statistics are quoted.

export type AreaId = 'payments' | 'deployment' | 'performance' | 'security';
export type AnswerValue = 'yes' | 'unsure' | 'no';
export type Answers = Record<string, AnswerValue | undefined>;

export interface LaunchArea {
  id: AreaId;
  title: string;
  blurb: string;
}

export interface LaunchQuestion {
  id: string;
  area: AreaId;
  text: string;
  /** One line: what to do if the answer is not a clear yes. */
  fix: string;
  /** Group id on /checklist that covers this topic (the anchor is "g-<id>"). */
  checklistGroup: string;
  /** Exact text of a matching /checklist item, when there is one. */
  checklistCheck?: string;
}

export const LAUNCH_AREAS: LaunchArea[] = [
  {
    id: 'payments',
    title: 'Payments',
    blurb: 'Taking money safely with Razorpay or Stripe.',
  },
  {
    id: 'deployment',
    title: 'Deployment',
    blurb: 'Running on the real domain with the real settings.',
  },
  {
    id: 'performance',
    title: 'Performance and cost',
    blurb: 'Staying fast and affordable when traffic grows.',
  },
  {
    id: 'security',
    title: 'Security',
    blurb: 'Keeping one customer out of another customer\'s data.',
  },
];

export const LAUNCH_ANSWERS: { value: AnswerValue; label: string }[] = [
  { value: 'yes', label: 'Yes, I have checked this' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'no', label: 'No' },
];

export const LAUNCH_QUESTIONS: LaunchQuestion[] = [
  // Payments
  {
    id: 'pay-webhook-signature',
    area: 'payments',
    text: 'Does your server verify the signature on every Razorpay or Stripe webhook before it acts on it?',
    fix: 'Verify the signature header with your webhook secret on the raw request body, and reject anything that fails.',
    checklistGroup: 'payments',
    checklistCheck: 'Your server verifies the signature on every payment webhook.',
  },
  {
    id: 'pay-webhook-retries',
    area: 'payments',
    text: 'If the same webhook arrives twice, or arrives late or out of order, does your app still end up with the right result?',
    fix: 'Store the event id and ignore ones you have already handled, and make each handler safe to run twice.',
    checklistGroup: 'payments',
    checklistCheck:
      'A webhook that arrives twice (Razorpay and Stripe both retry) does not grant access or send an email twice.',
  },
  {
    id: 'pay-server-price',
    area: 'payments',
    text: 'Does the server decide the price and what the customer gets, instead of trusting numbers sent from the browser?',
    fix: 'Look up the price and the product on the server, and grant access only after a verified payment event.',
    checklistGroup: 'payments',
    checklistCheck: 'The price and what the customer gets are decided on the server, not sent from the browser.',
  },
  {
    id: 'pay-live-test-keys',
    area: 'payments',
    text: 'Are your test keys and live keys kept apart, so that preview builds never hold live secrets and production never holds test keys?',
    fix: 'Put live keys only in the production environment settings, and run one real small payment to confirm it works.',
    checklistGroup: 'payments',
    checklistCheck: 'Test and live payment keys are kept apart, and live secrets are not in preview builds.',
  },
  {
    id: 'pay-refunds',
    area: 'payments',
    text: 'Do you know how to refund a customer, and what happens to their access in your app when you do?',
    fix: 'Write down the refund steps, handle the refund webhook, and test one refund end to end.',
    checklistGroup: 'payments',
    checklistCheck:
      'A refund or failed payment takes the access away again, and you have tried one with a small real payment.',
  },

  // Deployment
  {
    id: 'dep-env-vars',
    area: 'deployment',
    text: 'Are all environment variables set on your production host, with a startup check that fails loudly when one is missing?',
    fix: 'List every variable your app reads, set each one on the host, and make the app stop at boot if one is absent.',
    checklistGroup: 'deployment',
    checklistCheck:
      'Every environment variable is set on the production host, and the app fails loudly when one is missing.',
  },
  {
    id: 'dep-domain',
    area: 'deployment',
    text: 'Does your own domain work over HTTPS, and do the login and payment callback URLs point at that domain and not at a preview address?',
    fix: 'Update the allowed redirect and callback URLs in your auth and payment dashboards to the live domain only.',
    checklistGroup: 'deployment',
    checklistCheck:
      'Your custom domain uses HTTPS, and the login, payment and webhook URLs point to it, not a preview address.',
  },
  {
    id: 'dep-email',
    area: 'deployment',
    text: 'Does your domain have SPF, DKIM and DMARC records for the service that sends your email, and have you sent a test to a real inbox?',
    fix: 'Add the DNS records your email provider lists, then send a sign-up email to a Gmail and an Outlook address and check it is not in spam.',
    checklistGroup: 'email',
    checklistCheck: 'Your domain has SPF, DKIM and DMARC records set up for the service that sends your email.',
  },
  {
    id: 'dep-backups',
    area: 'deployment',
    text: 'Are backups of your database switched on, and do you know how long they are kept?',
    fix: 'Turn on backups in your database provider, and note the retention period in your own docs.',
    checklistGroup: 'backups',
    checklistCheck: 'Backups exist, and you know how long they are kept.',
  },
  {
    id: 'dep-restore',
    area: 'deployment',
    text: 'Has anyone actually restored a backup into a test copy and looked at the data?',
    fix: 'Restore the latest backup into a separate test database once, and write down the steps and how long it took.',
    checklistGroup: 'backups',
    checklistCheck: 'Someone has restored a backup at least once, into a test copy.',
  },

  // Performance and cost
  {
    id: 'perf-indexes',
    area: 'performance',
    text: 'Do the database columns you filter, sort or join on have indexes, and do your list pages load a page of rows rather than the whole table?',
    fix: 'Add an index on each column used in a where, order by or join, and add pagination to every list.',
    checklistGroup: 'performance',
    checklistCheck:
      'The columns your pages filter, join or sort by have database indexes.',
  },
  {
    id: 'perf-images',
    area: 'performance',
    text: 'Are your images resized and compressed, and served through an image optimiser or CDN instead of as full-size originals?',
    fix: 'Serve images through your framework\'s image component or a CDN, with width limits and modern formats.',
    checklistGroup: 'performance',
    checklistCheck:
      'Images are resized and compressed to the size they are shown at.',
  },
  {
    id: 'perf-bill-10k',
    area: 'performance',
    text: 'Have you worked out what your monthly bill would be at 10,000 visits, across every service you pay for?',
    fix: 'List each service with its plan and limits, then multiply its per-use price by 10,000 visits to get a rough figure.',
    checklistGroup: 'cost',
    checklistCheck:
      'You have worked out what a month of 10,000 visits would cost across hosting, database, email and AI calls.',
  },
  {
    id: 'perf-spend-caps',
    area: 'performance',
    text: 'Are spend caps and billing alerts set on every paid service, including hosting, database, email and AI model providers?',
    fix: 'Set a monthly cap or an alert at a figure you can afford in each provider\'s billing settings.',
    checklistGroup: 'cost',
    checklistCheck: 'Each paid provider that offers one (OpenAI, Anthropic, email, SMS) has a hard spend limit set, not only an alert.',
  },
  {
    id: 'perf-user-limits',
    area: 'performance',
    text: 'Do expensive actions, such as AI calls, emails and file uploads, have per-user limits that a script cannot get around?',
    fix: 'Add a per-user and per-IP rate limit on the server for each action that costs you money.',
    checklistGroup: 'cost',
    checklistCheck: 'Expensive actions (AI calls, emails, file uploads) have per-user and per-IP limits that the server enforces.',
  },

  // Security
  {
    id: 'sec-rls-on',
    area: 'security',
    text: 'Is row level security (RLS) switched on for every table your app exposes?',
    fix: 'Enable RLS on each table, then add policies for the access you want, because a table with RLS on and no policy returns nothing.',
    checklistGroup: 'database',
    checklistCheck: 'Row level security (RLS) is switched on for every table your app exposes.',
  },
  {
    id: 'sec-rls-owner',
    area: 'security',
    text: 'Does each RLS policy limit rows to their owner, rather than allowing any logged-in user?',
    fix: 'Rewrite each policy to compare the row owner with the signed-in user id, then test with two accounts.',
    checklistGroup: 'database',
    checklistCheck: 'Each policy limits rows to their owner, not just "any logged-in user".',
  },
  {
    id: 'sec-secrets-browser',
    area: 'security',
    text: 'Are your secret and service-level keys kept out of the code that your browser downloads?',
    fix: 'Move secret keys to server-only code and settings, and rotate any key that was ever in the browser or in git history.',
    checklistGroup: 'secrets',
    checklistCheck: 'Your service-level or "secret" keys are not in the code your browser downloads.',
  },
  {
    id: 'sec-server-auth',
    area: 'security',
    text: 'Do your pages and API routes check the logged-in user on the server, and not only by hiding buttons in the interface?',
    fix: 'Add a server-side session check to every route that returns or changes data, and return 401 or 403 when it fails.',
    checklistGroup: 'login',
    checklistCheck: 'Pages and API routes check the user on the server, not only by hiding buttons.',
  },
  {
    id: 'sec-admin-role',
    area: 'security',
    text: 'Does admin and role information come from data that users cannot edit themselves?',
    fix: 'Keep roles in a table or claim that only the server can write, and never read the role from a field the user can change.',
    checklistGroup: 'login',
    checklistCheck: 'Admin and role information comes from data users cannot edit.',
  },
];

/** Same slug on the /checklist page (as the id of each item) and in the links from here. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Link to the matching checklist item, or to its group when no item matches exactly. */
export function checklistHref(q: LaunchQuestion): string {
  return q.checklistCheck ? `/checklist#${slugify(q.checklistCheck)}` : `/checklist#g-${q.checklistGroup}`;
}

export interface AreaScore {
  area: AreaId;
  yes: number;
  answered: number;
  total: number;
}

export function scoreByArea(answers: Answers): AreaScore[] {
  return LAUNCH_AREAS.map((a) => {
    const qs = LAUNCH_QUESTIONS.filter((q) => q.area === a.id);
    const given = qs.filter((q) => isAnswer(answers[q.id]));
    return {
      area: a.id,
      yes: given.filter((q) => answers[q.id] === 'yes').length,
      answered: given.length,
      total: qs.length,
    };
  });
}

/** Every question answered "no" or "not sure", in question order. */
export function findGaps(answers: Answers): LaunchQuestion[] {
  return LAUNCH_QUESTIONS.filter((q) => {
    const a = answers[q.id];
    return a === 'no' || a === 'unsure';
  });
}

export function isComplete(answers: Answers): boolean {
  return LAUNCH_QUESTIONS.every((q) => isAnswer(answers[q.id]));
}

function isAnswer(v: unknown): v is AnswerValue {
  return v === 'yes' || v === 'unsure' || v === 'no';
}
