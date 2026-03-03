'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 bg-slate-950 border-t border-slate-800/60 overflow-hidden">
      {/* Subtle radial glow — barely visible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(249,115,22,0.05), transparent)',
        }}
      />

      <div className="relative container px-6 mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[11px] font-semibold tracking-[0.15em] text-orange-400/60 uppercase mb-4"
        >
          Your next chapter
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="text-4xl md:text-5xl font-bold tracking-[-0.02em] text-white mb-5"
        >
          Your Next Quest Awaits
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Join the guild, start coding real projects, and build a portfolio that opens doors.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="h-12 px-7 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-black shadow-lg shadow-orange-500/20 transition-all"
          >
            <Link href="/register" className="flex items-center gap-2">
              Enter the Guild <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-7 text-sm font-medium rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent transition-colors"
          >
            <Link href="/register-company">Post quests as a company</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
