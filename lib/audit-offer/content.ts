const MAIL_BODY = [
  'Hi,',
  '',
  'I would like a Production Check.',
  '',
  'App URL:',
  'Stack (for example Lovable + Supabase + Stripe):',
  'What the app does:',
  'Anything you are worried about:',
].join('\n');

export const AUDIT_MAILTO = `mailto:abid@guilds.work?subject=Production%20Check%20request&body=${encodeURIComponent(MAIL_BODY)}`;

export const AUDIT_CHECKS = [
  'Database access rules, such as Supabase row level security (RLS): can one user read or change another user\'s data?',
  'Exposed API keys and secrets in your code, build and browser.',
  'Login and sessions: sign-up, password reset, admin pages and logout.',
  'Payments and Stripe webhooks: does the server decide the price and who gets access?',
  'Backups: do they exist, and has anyone ever restored one?',
  'Email setup (SPF, DKIM, DMARC) so your emails reach the inbox and cannot be faked easily.',
  'Basic privacy and cookie consent: what personal data you keep and whether you tell people.',
  'Cost blowups on free tiers: limits, spend caps and calls that anyone could run up.',
];

export const AUDIT_PACKAGES = [
  {
    name: 'Check',
    price: '$99',
    time: '2 working days',
    points: [
      'A report listing each finding with a severity (critical, high, medium, low).',
      'A fixed quote to fix what we found.',
      'The $99 is credited to a Fix.',
    ],
  },
  {
    name: 'Fix',
    price: 'From $800',
    time: 'Fixed quote after the Check',
    points: [
      'We fix the critical and high findings.',
      'We re-check them and tell you what is now closed.',
      'Price depends on the size of your app and what the Check finds.',
    ],
  },
  {
    name: 'Care',
    price: 'From $150/month',
    time: 'Monthly',
    points: [
      'Dependency and platform updates.',
      'A monthly check that backups work.',
      'Monitoring, and 2 hours of fixes each month.',
    ],
  },
];

export const AUDIT_STEPS = [
  'Send us the link to your app and a few lines on what it does.',
  'Sign a short scope form. We only test your own app, never third-party systems, and we do no load testing.',
  'Get the report in 2 working days.',
];

export const AUDIT_HONEST_NOTE =
  'A Check is a point-in-time review, not a guarantee that nothing can go wrong.';

type Item = { check: string; why: string };
export type ChecklistGroup = { id: string; title: string; items: Item[] };

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    id: 'database',
    title: 'Database access rules',
    items: [
      {
        check: 'Row level security (RLS) is switched on for every table your app exposes.',
        why: 'A table without RLS can be read or changed by anyone who has your public key, and that key is in your website code.',
      },
      {
        check: 'Each policy limits rows to their owner, not just "any logged-in user".',
        why: 'A policy that only checks "logged in" lets every customer see every other customer\'s rows.',
      },
      {
        check: 'Users cannot change the owner field of a row, or edit rows that are not theirs.',
        why: 'Otherwise one user can hand their data to, or take data from, someone else.',
      },
      {
        check: 'Storage buckets that hold private files (invoices, IDs, uploads) are private.',
        why: 'A public bucket makes every file reachable by anyone who has the link.',
      },
    ],
  },
  {
    id: 'secrets',
    title: 'Keys and secrets',
    items: [
      {
        check: 'Your service-level or "secret" keys are not in the code your browser downloads.',
        why: 'Anyone can read browser code. A secret key there gives full access and bypasses your access rules.',
      },
      {
        check: 'Any key that was ever public has been rotated, not just deleted.',
        why: 'Old commits and build logs keep the key. Removing it from the latest file does not make it safe again.',
      },
      {
        check: 'No .env file is committed, and variables with a public prefix (NEXT_PUBLIC_, VITE_) hold nothing secret.',
        why: 'Those prefixes mean "send to every visitor".',
      },
      {
        check: 'Calls to paid services (AI models, maps, email) go through your own server, not straight from the browser.',
        why: 'A key in the browser can be copied and used to run up your bill.',
      },
    ],
  },
  {
    id: 'login',
    title: 'Login and sessions',
    items: [
      {
        check: 'Pages and API routes check the user on the server, not only by hiding buttons.',
        why: 'Hidden buttons stop nobody. The server is the only place a rule can be enforced.',
      },
      {
        check: 'Admin and role information comes from data users cannot edit.',
        why: 'If a role is stored where the user can change it, anyone can make themselves an admin.',
      },
      {
        check: 'Password reset shows the same message whether or not the email exists, and links expire.',
        why: 'Different messages let strangers find out who uses your app.',
      },
      {
        check: 'Redirect URLs for login are limited to your own domains, with no wildcards.',
        why: 'A loose list can send users to a look-alike site right after they log in.',
      },
      {
        check: 'Two-step login (MFA) is on for the owner accounts: hosting, database, payments and domain.',
        why: 'One stolen password on those accounts can mean losing the whole business.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        check: 'Your server verifies the signature on every payment webhook.',
        why: 'Without it, anyone can send a fake "payment received" message and get access for free.',
      },
      {
        check: 'The price and what the customer gets are decided on the server, not sent from the browser.',
        why: 'A price set in the browser can be changed by the person paying.',
      },
      {
        check: 'Test and live payment keys are kept apart, and live secrets are not in preview builds.',
        why: 'Mixing them causes real charges during tests, or test orders treated as paid.',
      },
    ],
  },
  {
    id: 'backups',
    title: 'Backups and recovery',
    items: [
      {
        check: 'Backups exist, and you know how long they are kept.',
        why: 'Many free plans keep none. You find out when you need one.',
      },
      {
        check: 'Someone has restored a backup at least once, into a test copy.',
        why: 'A backup you have never restored is only a hope.',
      },
    ],
  },
  {
    id: 'email',
    title: 'Email',
    items: [
      {
        check: 'Your domain has SPF, DKIM and DMARC records set up for the service that sends your email.',
        why: 'Without them, your emails land in spam and others can send mail that looks like yours.',
      },
      {
        check: 'Sign-up and password emails go out through your own sending setup, not a shared default sender.',
        why: 'Shared senders have low limits and a poor reputation, so your login emails may not arrive.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy and consent',
    items: [
      {
        check: 'You can list what personal data you collect, where it is stored and why.',
        why: 'You cannot protect, or delete on request, data you cannot list.',
      },
      {
        check: 'A privacy policy is linked from the site and matches what the app really does.',
        why: 'A policy that does not match practice is worse than none.',
      },
      {
        check: 'Non-essential cookies and trackers wait for consent where the law requires it.',
        why: 'Visitors from the EU, UK and some other places must be asked first.',
      },
    ],
  },
  {
    id: 'cost',
    title: 'Cost and limits',
    items: [
      {
        check: 'You know every service you use, its plan, its limits, and who pays when a limit is hit.',
        why: 'Surprise bills and surprise shutdowns both come from limits nobody wrote down.',
      },
      {
        check: 'Spend caps and billing alerts are set on every paid service.',
        why: 'A loop or a viral day can cost real money before you notice.',
      },
      {
        check: 'Expensive actions (AI calls, emails, file uploads) have per-user limits.',
        why: 'One person, or one script, can otherwise use up your whole budget.',
      },
    ],
  },
];
