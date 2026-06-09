import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type InfoPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function InfoPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
  aside,
  backHref = '/home',
  backLabel = 'Back to home',
}: InfoPageShellProps) {
  return (
    <main className="min-h-screen bg-background ds-page-grain">
      <section className="relative overflow-hidden border-b border-border/70 pt-24 md:pt-32">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_58%)]" />
        <div className="absolute right-[-6rem] top-20 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute left-[-4rem] top-36 h-40 w-40 rounded-full bg-amber-100/80 blur-3xl" />

        <div className="ds-container relative pb-14 md:pb-16">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
              {eyebrow}
            </div>
            <h1 className="ds-display mt-6 font-display text-[2.6rem] text-slate-950 md:text-[4rem]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              {description}
            </p>
            {updatedAt ? (
              <p className="mt-6 text-sm font-medium text-slate-400">Last updated: {updatedAt}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="ds-section-sm">
        <div className={cn('ds-container', aside && 'grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start')}>
          <div className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] md:p-10">
            {children}
          </div>
          {aside ? <aside className="space-y-4">{aside}</aside> : null}
        </div>
      </section>
    </main>
  );
}

export function InfoPageAside({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/88 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] backdrop-blur">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </div>
  );
}

export function InfoPageProse({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8 text-slate-600 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-[-0.03em] [&_h2]:text-slate-950 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:leading-7 [&_p]:leading-8 [&_section]:space-y-4 [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
      {children}
    </div>
  );
}
