import Link from 'next/link';
import { FileText, Lock, Scale, ShieldCheck } from 'lucide-react';
import {
  InfoPageAside,
  InfoPageProse,
  InfoPageShell,
} from '@/components/public/info-page-shell';

const legalLinks = [
  {
    title: 'Privacy Policy',
    href: '/legal/privacy',
    description: 'How account, profile, payment, and usage data are collected, processed, and protected.',
    icon: Lock,
  },
  {
    title: 'Terms of Service',
    href: '/legal/terms',
    description: 'The service agreement covering quests, payouts, conduct, account rules, and liability.',
    icon: Scale,
  },
];

export const metadata = {
  title: 'Legal | Guild',
  description: 'Legal policies and reference documents for Guild.',
};

export default function LegalPage() {
  return (
    <InfoPageShell
      eyebrow="Legal Hub"
      title="The policy and legal reference library for Guild."
      description="Everything here is meant to make the platform easier to trust: privacy, terms, and the operating rules behind how the Guild works."
      aside={
        <>
          <InfoPageAside title="Why This Exists">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-4 w-4 text-orange-500" />
              <p>Trust on the platform depends on clear rules, clear data handling, and predictable enforcement.</p>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-4 w-4 text-orange-500" />
              <p>Use this hub when you need the official version, not just a summary from the marketing pages.</p>
            </div>
          </InfoPageAside>
        </>
      }
    >
      <InfoPageProse>
        <section>
          <h2>Available documents</h2>
          <p>
            Start here when you want the platform&apos;s official legal or policy language. The
            pages below are designed to be readable but specific enough for real reference.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-6 transition-all hover:border-orange-100 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
            >
              <item.icon className="h-5 w-5 text-orange-500" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>

        <section>
          <h2>Related pages</h2>
          <p>
            If you want the simpler public-facing versions first, you can also read the shorter{' '}
            <Link href="/privacy" className="font-medium text-orange-600 hover:text-orange-500">
              privacy page
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="font-medium text-orange-600 hover:text-orange-500">
              terms page
            </Link>
            .
          </p>
        </section>
      </InfoPageProse>
    </InfoPageShell>
  );
}
