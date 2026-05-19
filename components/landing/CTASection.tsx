'use client';

import { ArrowRight, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '$50K+', label: 'Paid to developers' },
  { value: '500+', label: 'Quests completed' },
  { value: '94%', label: 'Satisfaction rate' },
  { value: '2.5x', label: 'Avg. income boost' },
];

const testimonials = [
  {
    quote: 'I went from building todo apps to shipping production features for real startups. The progression system kept me motivated.',
    name: 'Alex Chen',
    role: 'B-Rank Adventurer',
  },
  {
    quote: 'As a founder, I needed devs I could trust. The rank system on Adventurers Guild made vetting so much easier.',
    name: 'Sarah Park',
    role: 'CTO, Relay',
  },
  {
    quote: 'The quest reviews were tougher than any interview I\'ve done. But that\'s exactly why I got my dream job after.',
    name: 'Marcus Johnson',
    role: 'S-Rank Adventurer',
  },
];

export default function CTASection() {
  return (
    <>
      {/* Testimonials */}
      <section className="border-t border-slate-800/60 bg-slate-950 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400/70">
              Trusted by the ambitious
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              What our community says
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-slate-800/60 bg-slate-900 py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="text-center"
              >
                <p className="text-3xl font-bold tracking-tight text-white">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-slate-800/60 bg-slate-950 py-24 md:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(99,102,241,0.12), transparent), radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.06), transparent)',
          }}
        />

        <div className="relative container mx-auto max-w-4xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-400/70"
          >
            Your next chapter starts now
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white md:text-5xl"
          >
            Ship code.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Level up.
            </span>
            <br />
            Get paid.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-400"
          >
            Join hundreds of developers already earning real income through quest-based work.
            No applications, no interviews — just code that ships.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white hover:bg-indigo-500">
              <Link href="/register">
                Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-slate-700 bg-transparent px-8 text-sm text-slate-300 hover:bg-slate-800">
              <Link href="/quests">
                Browse Quests
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> No equity required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Keep your IP
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Cancel anytime
            </span>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-12">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="text-lg font-bold tracking-tight text-white">
                Adventurers Guild
              </Link>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                The quest-based platform where developers build real skills, earn real income,
                and climb the ranks.
              </p>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Platform
              </p>
              <ul className="space-y-2">
                {['Browse Quests', 'For Companies', 'Leaderboard', 'Rank System'].map((item) => (
                  <li key={item}>
                    <Link
                      href={
                        item === 'Browse Quests' ? '/quests' :
                        item === 'For Companies' ? '/register-company' :
                        item === 'Leaderboard' ? '/leaderboard' :
                        '/ranks'
                      }
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Company
              </p>
              <ul className="space-y-2">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800/60 pt-8 text-xs text-slate-600 md:flex-row">
            <p>&copy; {new Date().getFullYear()} Adventurers Guild. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="transition-colors hover:text-slate-400">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-slate-400">Terms</Link>
              <Link href="/cookies" className="transition-colors hover:text-slate-400">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
