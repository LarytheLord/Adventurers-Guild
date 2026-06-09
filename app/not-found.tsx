import Link from 'next/link';
import { ArrowLeft, Compass, Home, ScrollText, Sword } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background ds-page-grain">
      <section className="relative overflow-hidden pt-24 md:pt-32">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_58%)]" />
        <div className="absolute right-[-8rem] top-16 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute left-[-6rem] top-36 h-48 w-48 rounded-full bg-amber-100/80 blur-3xl" />

        <div className="ds-container relative pb-20">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur">
              <Compass className="h-3.5 w-3.5" />
              Lost In The Guild
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Error 404</p>
                <h1 className="ds-display mt-4 font-display text-[3rem] text-slate-950 md:text-[4.8rem]">
                  This quest board entry doesn&apos;t exist in this realm.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                  The page you were looking for may have moved, expired, or never made it out of
                  staging. Let&apos;s get you back to something real.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl bg-slate-950 px-7 text-white hover:bg-slate-800"
                  >
                    <Link href="/home">
                      <Home className="mr-2 h-4 w-4" />
                      Back to home
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-slate-300 bg-white/80 px-7 text-slate-700 hover:bg-slate-100"
                  >
                    <Link href="/quests">
                      <Sword className="mr-2 h-4 w-4" />
                      Browse quests
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] md:p-8">
                <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-6">
                  <p className="font-display text-7xl font-bold tracking-[-0.06em] text-slate-200">
                    404
                  </p>
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">Suggested next moves</h2>
                  <div className="mt-5 space-y-3">
                    <Link
                      href="/home"
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:border-orange-100 hover:text-orange-600"
                    >
                      Return to the Guild homepage
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                    <Link
                      href="/legal"
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:border-orange-100 hover:text-orange-600"
                    >
                      Read legal and policy pages
                      <ScrollText className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/faq"
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:border-orange-100 hover:text-orange-600"
                    >
                      Jump to frequently asked questions
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
