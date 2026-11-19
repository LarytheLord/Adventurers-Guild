export const SITE_URL = 'https://www.guilds.work';

export interface GuideEntry {
  path: string;
  title: string;
  summary: string;
}

export const GUIDES: GuideEntry[] = [
  {
    path: '/guides/payment-webhook-checklist-razorpay-stripe',
    title: 'Payment webhook checklist for Razorpay and Stripe (Next.js)',
    summary: 'Six manual checks for a payment webhook, each linked to the official docs.',
  },
  {
    path: '/guides/cert-in-ai-security-auditing-guidelines',
    title: 'CERT-In AI Security Auditing Guidelines (2026), explained for startups',
    summary: 'Who the guideline covers, how the four risk tiers work, and a 30-day plan.',
  },
];
