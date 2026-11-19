import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageShell } from '@/components/public/info-page-shell';
import { GUIDES } from '@/lib/guides';

const DESCRIPTION = 'Free guides from Guild for founders who ship AI-built apps and AI systems.';

export const metadata: Metadata = {
  title: 'Guides - Guild',
  description: DESCRIPTION,
  alternates: { canonical: '/guides' },
};

export default function GuidesHubPage() {
  return (
    <InfoPageShell eyebrow="Guides" title="Guides" description={DESCRIPTION}>
      <ul className="space-y-4">
        {GUIDES.map((g) => (
          <li key={g.path} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Link
              href={g.path}
              className="font-display text-lg font-bold text-slate-950 underline-offset-4 hover:underline"
            >
              {g.title}
            </Link>
            <p className="mt-1 text-sm leading-6 text-slate-600">{g.summary}</p>
          </li>
        ))}
      </ul>
    </InfoPageShell>
  );
}
