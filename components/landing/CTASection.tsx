'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-slate-800/60 bg-slate-950 py-24 md:py-32">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 100%, rgba(249,115,22,0.10), transparent), radial-gradient(ellipse 65% 50% at 90% 0%, rgba(14,165,233,0.10), transparent)',
        }}
      />

      <div className="relative container mx-auto max-w-4xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/70"
        >
          Your next chapter
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-[0_24px_44px_-32px_rgba(15,23,42,0.8)] sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-orange-300/20 bg-gradient-to-b from-orange-500/10 to-orange-500/0 p-5">
              <h3 className="text-lg font-semibold text-white">For Adventurers</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Claim quests, submit production code, and build rank-based reputation that compounds over time.
              </p>
              <Button asChild size="lg" className="mt-5 h-11 rounded-xl px-6 text-sm">
                <Link href="/register" className="flex items-center gap-2">
                  Enter the Guild <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-5">
              <h3 className="text-lg font-semibold text-white">For Companies</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Post real development quests, evaluate submissions quickly, and pay only when delivery meets standards.
              </p>
              <Button asChild variant="outline" size="lg" className="mt-5 h-11 rounded-xl border-slate-600 bg-transparent px-6 text-sm text-slate-200 hover:bg-slate-800">
                <Link href="/register-company">Launch a Company Account</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
