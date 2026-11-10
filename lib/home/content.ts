export const HOME_TITLE = 'Guild - independent checks for the AI you ship';
export const HOME_DESCRIPTION =
  'Guild tests AI systems and the apps built around them, and writes down what we find. CERT-In AI audit readiness for Indian teams, and a Launch Check for apps built with Lovable, Bolt, Replit, v0 or Cursor.';

export const HOME_MAILTO = 'mailto:abid@guilds.work?subject=Guild%20enquiry';

export const HOME_HERO = {
  eyebrow: 'Independent AI assurance',
  headline: 'Independent checks for the AI you ship.',
  lead:
    'We test your AI system and the app around it, then give you a written report of what we found and how serious it is. You fix it, or we fix it with you.',
  primary: { label: 'Launch Check for AI-built apps', href: '/audit' },
  secondary: { label: 'CERT-In AI readiness', href: '/ai-risk-tier' },
};

export const HOME_OFFERS = [
  {
    id: 'cert-in',
    kicker: 'For teams in India',
    title: 'CERT-In AI audit readiness',
    body:
      'The CERT-In AI Security Auditing Guidelines ask organisations that run AI to know which AI they use, how risky it is, and what evidence they hold. We help you get ready: list your AI systems, work out the risk tier, and test the system before an auditor does.',
    points: [
      'Find out which risk tier your system is likely to fall in, free, in a few minutes.',
      'Read what the guideline asks for, with section references.',
    ],
    primary: { label: 'Check your AI risk tier', href: '/ai-risk-tier' },
    secondary: {
      label: 'Read the guideline explainer',
      href: '/guides/cert-in-ai-security-auditing-guidelines',
    },
  },
  {
    id: 'production-check',
    kicker: 'For founders shipping fast',
    title: 'Launch Check for AI-built apps',
    body:
      'Built your app with Lovable, Bolt, Replit, v0 or Cursor? We check it, fix it and help you ship it. We cover four areas equally: payments, deployment and domains, performance and cost, and security and data access.',
    points: [
      'Written report, each finding rated critical, high, medium or low.',
      'Optional fixes, at a fixed quote after the check.',
    ],
    primary: { label: 'See the Launch Check', href: '/audit' },
    secondary: null,
  },
];

export const HOME_PARTNER_NOTE =
  'Work with CERT-In empanelled auditors? We can do the AI-specific testing, such as prompt injection and agent permissions, as a partner to your audit team. Email us.';

export const HOME_HOW_TITLE = 'How we work';
export const HOME_HOW = [
  {
    title: 'Your own systems only',
    body: 'We test systems you own or are allowed to test. We do not test anyone else\'s.',
  },
  {
    title: 'Written scope first',
    body: 'Before we start, we agree in writing what we will test, what we will not, and when.',
  },
  {
    title: 'A report with severity',
    body: 'You get each finding with a severity and a clear way to reproduce it, so your team can fix it.',
  },
  {
    title: 'What we are not',
    body:
      'Guild is not a CERT-In empanelled auditor. We do not issue a CERT-In audit or a certificate. We help you prepare for one, and we test as a partner to firms that are empanelled.',
  },
];

export const HOME_RESOURCES_TITLE = 'Free resources';
export const HOME_RESOURCES = [
  {
    label: 'AI risk tier check',
    body: 'Answer a few questions and see the likely CERT-In tier for your system.',
    href: '/ai-risk-tier',
  },
  {
    label: 'CERT-In guideline explained',
    body: 'The AI Security Auditing Guidelines in plain words, with the source text cited.',
    href: '/guides/cert-in-ai-security-auditing-guidelines',
  },
  {
    label: 'Launch checklist',
    body: 'A short checklist for payments, deployment, speed and security before you launch an AI-built app.',
    href: '/checklist',
  },
];

export const HOME_CONTACT = {
  title: 'Talk to us',
  body: 'Tell us what you run and what worries you. We reply by email and tell you plainly if we are the right fit.',
  label: 'Email abid@guilds.work',
  href: HOME_MAILTO,
};

export const HOME_TALENT = {
  label: 'Looking for the Adventurers talent network? Go to the student side.',
  href: '/adventurers',
};
