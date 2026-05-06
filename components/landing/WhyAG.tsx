'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, DollarSign, Trophy, Bot } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Credentials',
    description:
      'Your Guild Card shows rank, quests, and quality scores — all verifiable by employers.',
  },
  {
    icon: DollarSign,
    title: 'Real Paid Work',
    description:
      'Not toy problems. Real client tasks that ship to production and pay real money.',
  },
  {
    icon: Trophy,
    title: 'RPG Progression',
    description:
      'F-Rank to S-Rank. Every quest completion levels you up and unlocks better opportunities.',
  },
  {
    icon: Bot,
    title: 'AI-Augmented',
    description:
      'Use any tools. We measure delivery capability, not typing speed.',
  },
];

export default function WhyAG() {
  return (
    <section className="py-20 md:py-28 bg-slate-900">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-500 uppercase mb-3">
            Why Adventurers Guild
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-white">
            Built different
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            The only platform that combines real paid work with gamified progression and verified credentials.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-slate-950 rounded-xl border border-slate-800 p-6 hover:border-orange-500/30 transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
