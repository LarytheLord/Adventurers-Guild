const MAIL_BODY = [
  'Hi,',
  '',
  'I would like a Launch Check.',
  '',
  'App URL:',
  'Stack (for example Lovable + Supabase + Stripe):',
  'What the app does:',
  'Anything you are worried about:',
].join('\n');

export const AUDIT_MAILTO = `mailto:abid@guilds.work?subject=Launch%20Check%20request&body=${encodeURIComponent(MAIL_BODY)}`;

export const AUDIT_TOOLS = 'Lovable, Bolt, Replit, v0 or Cursor';

export type AuditArea = { id: string; title: string; summary: string; checks: string[] };

// Four areas, four checks each, so no area outweighs another.
export const AUDIT_AREAS: AuditArea[] = [
  {
    id: 'payments',
    title: 'Payments work end to end',
    summary: 'Money comes in, access follows, and refunds undo it.',
    checks: [
      'Razorpay and Stripe webhooks are verified by signature, and a repeated webhook does not grant access twice.',
      'The server decides the price and who gets access, not the browser.',
      'Refunds and failed payments take access away again, and we run one through.',
      'Test and live keys are kept apart, and the live webhook endpoint and secret are the ones in use.',
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment and domains',
    summary: 'The app that runs in production is the one you tested.',
    checks: [
      'Environment variables are set on the production host, and nothing is missing or left on the builder.',
      'Your custom domain has HTTPS, redirects work, and login and webhook URLs point to it.',
      'Email deliverability: SPF, DKIM and DMARC are set so sign-up and receipt emails reach the inbox.',
      'Backups exist, and someone has restored one into a test copy.',
    ],
  },
  {
    id: 'performance',
    title: 'Performance and cost',
    summary: 'Pages load quickly, and a good week does not become a bad bill.',
    checks: [
      'Page speed of your main pages, measured with standard tools, with the slowest causes named.',
      'Database indexes on the columns your pages filter and sort by.',
      'Image sizes: large uploads are resized and compressed before they reach visitors.',
      'A written estimate of your monthly bill at 10,000 visits, and where it would jump.',
    ],
  },
  {
    id: 'security',
    title: 'Security and data access',
    summary: 'One user cannot read or change another user\'s data.',
    checks: [
      'Database access rules, such as Supabase row level security (RLS), limit rows to their owner.',
      'Secrets and API keys are not in your code, build or browser, and old leaked keys are rotated.',
      'Login and sessions: sign-up, password reset, admin pages and logout are enforced on the server.',
      'Private files are private, and you can list what personal data you keep.',
    ],
  },
];

export const AUDIT_PACKAGES = [
  {
    name: 'Check',
    price: '$99',
    time: '2 working days',
    points: [
      'A report listing each finding with a severity (critical, high, medium, low).',
      'A fixed quote after the check for fixing what we found.',
      'The $99 is credited to a Fix.',
    ],
  },
  {
    name: 'Fix',
    price: 'From $800',
    time: 'Fixed quote after the Check',
    points: [
      'We fix the critical and high findings and ship them with you.',
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

export const AUDIT_PRICE_NOTE =
  'Prices are as shown. The Fix is a fixed quote after the check, based on what the check finds.';

export const AUDIT_STEPS = [
  'Send us the link to your app and a few lines on what it does.',
  'Sign a short scope form. We only test your own app, never third-party systems, and we do no load testing.',
  'Get the report in 2 working days.',
];

export const AUDIT_HONEST_NOTE =
  'A Launch Check is a point-in-time review, not a guarantee that nothing can go wrong. Guild is not a CERT-In empanelled auditor, and a Launch Check is not an audit or a certificate.';

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
      {
        check: 'Plan, subscription status, credits, usage counters and rate-limit values are not on any table or column that users can update through RLS.',
        why: 'Users can give themselves premium by editing their own row. Keep these values in a table with no insert or update policy for users, and change them only from the server or a webhook.',
      },
      {
        check: 'Table permissions (GRANTs) are set on purpose: the anon role has no access to tables that do not need it, and nobody was given access before RLS was on.',
        why: 'RLS and GRANTs are two separate gates. Newer Supabase projects need explicit GRANTs on new tables, and old defaults can leave the anon role with broad rights on every table. Grant only what each role needs, and only after RLS is enabled.',
      },
      {
        check: 'Views are created as security invoker, and every SECURITY DEFINER function pins its search_path and is not executable by anon unless it must be.',
        why: 'A view or definer function runs with its owner\'s rights and skips RLS, so it can hand out rows your policies protect. Use security_invoker views, set search_path on definer functions, and check who is calling inside them.',
      },
      {
        check: 'No policy on a sensitive table says USING (true) or WITH CHECK (true) for anon or for all logged-in users.',
        why: 'A policy like that turns RLS on in name only and lets anyone read, or overwrite, every row. Replace it with a check against the row\'s owner or tenant, including on UPDATE.',
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
        check: 'Calls to paid AI models and map services go through your own server, not straight from the browser.',
        why: 'A key in the browser can be copied and used to run up your bill.',
      },
      {
        check: 'The Stripe secret key, and keys for services such as SendGrid, S3 or R2, are only used in server code, never sent to the browser.',
        why: 'Anyone can copy a key from the browser and use it as you, so keep these keys in server-side environment variables, not in code the browser downloads.',
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
        check: 'API routes that update or create rows pick the fields they accept, instead of passing the whole request body into the database call.',
        why: 'This is called mass assignment. If the body is passed straight through, a user can add fields such as role, plan or status and set them on themselves. Allow-list the fields, or validate with a schema.',
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
      {
        check: 'A webhook that arrives twice (Razorpay and Stripe both retry) does not grant access or send an email twice.',
        why: 'Retries are normal, so a handler that is not safe to repeat gives away access or double-sends.',
      },
      {
        check: 'A refund or failed payment takes the access away again, and you have tried one with a small real payment.',
        why: 'Otherwise people keep what they paid for after the money has gone back.',
      },
      {
        check: 'You have made one real live-mode payment end to end, and it reached your database and the buyer\'s inbox.',
        why: 'Test mode can pass while the live webhook URL or secret is wrong, and you then miss real orders.',
      },
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment and domains',
    items: [
      {
        check: 'Every environment variable is set on the production host, and the app fails loudly when one is missing.',
        why: 'Values that only exist on your laptop or in the builder preview make features break quietly after launch.',
      },
      {
        check: 'Your custom domain uses HTTPS, and the login, payment and webhook URLs point to it, not a preview address.',
        why: 'A leftover preview URL breaks logins and sends payment events to the wrong place.',
      },
      {
        check: 'The production domain sends security headers: Content-Security-Policy, frame-ancestors (or X-Frame-Options), X-Content-Type-Options: nosniff, a Referrer-Policy and HSTS.',
        why: 'They limit what an injected script or a hostile page can do to your visitors. Check the headers on the live domain, not on localhost, because your host or proxy can add or drop them.',
      },
      {
        check: 'Next.js and your other dependencies are on patched versions, and something (npm audit on production dependencies, or Dependabot) warns you about new security advisories.',
        why: 'Framework flaws are published openly and attackers scan for apps still running old versions. A known advisory on an unpatched framework can be enough for a takeover.',
      },
      {
        check: 'The main branch is protected, required checks must pass before merge, and CI workflows have only the permissions they need.',
        why: 'Without branch protection one bad push goes straight to production. Use branch protection on main, deploy only from main, pin third-party actions, and give workflows read-only tokens unless a job needs more.',
      },
    ],
  },
  {
    id: 'performance',
    title: 'Speed and database',
    items: [
      {
        check: 'The columns your pages filter, join or sort by have database indexes.',
        why: 'A page that is fast with 20 rows can crawl with real data, and indexes are the usual fix.',
      },
      {
        check: 'Images are resized and compressed to the size they are shown at.',
        why: 'Multi-megabyte images slow every page and add to your bandwidth bill.',
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
        check: 'Billing alerts are set on every paid service, so you hear about a spike early.',
        why: 'A loop or a viral day can cost real money before you notice.',
      },
      {
        check: 'You have worked out what a month of 10,000 visits would cost across hosting, database, email and AI calls.',
        why: 'The number tells you which plan limit or per-call price will hurt first.',
      },
      {
        check: 'Expensive actions (AI calls, emails, file uploads) have per-user and per-IP limits that the server enforces.',
        why: 'One person, or one script, can otherwise use up your whole budget, and a limit that only exists in the frontend can be bypassed.',
      },
      {
        check: 'Rate limiting is tested on the live app, and it fails closed: if its store or environment variable is missing, requests are limited or refused, not let through.',
        why: 'A limiter that keeps counts in server memory does little on serverless hosts, and one that quietly does nothing when Redis is not configured protects nothing. Send a burst of requests to the live app and confirm the limit actually triggers.',
      },
      {
        check: 'Each paid provider that offers one (OpenAI, Anthropic, email, SMS) has a hard spend limit set, not only an alert.',
        why: 'An alert tells you after the money is gone. Where a provider has no hard limit, also enforce a budget in your own server code.',
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI behaviour',
    items: [
      {
        check: 'Prompt injection: text typed by a user, or content your app fetches, cannot trick the model into leaking data or calling tools it should not.',
        why: 'No prompt fully stops this, so limit what a tricked model can do: keep secrets out of the prompt, give it few tools, and test with lines such as "ignore the rules above".',
      },
      {
        check: 'The AI can only use the tools and data it needs, and the server checks who is asking before each tool runs.',
        why: 'Give the model only the tools and data it needs, with read-only access where possible, and have the server check who is asking.',
      },
      {
        check: 'AI output is never run or shown as raw SQL or HTML.',
        why: 'Pass model output through prepared queries with parameters, an allow-list or an HTML sanitizer first, as you would any user input.',
      },
    ],
  },
];
