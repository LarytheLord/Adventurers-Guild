'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create your character',
    description:
      'Sign up and pick your specialization. You start as an F-Rank adventurer with access to beginner quests.',
  },
  {
    number: '02',
    title: 'Accept quests',
    description:
      'Browse real coding tasks from companies. Pick one that matches your skills, write the code, and submit.',
  },
  {
    number: '03',
    title: 'Level up & earn',
    description:
      'Get paid for completed work. Earn XP to rank up, unlock harder quests, and build your reputation.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container px-6 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-500/70 uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-900">
            Three steps to your first quest
          </h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-5 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-orange-400/60 via-orange-400/30 to-orange-400/60" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-sm font-bold text-slate-300 mb-5 z-10">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
