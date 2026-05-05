'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Do I need prior experience to start?',
    answer: 'F-rank exists for this exact reason. Quests are scoped to your current skill level - your first quest is designed to be completable at F-rank, not your aspirational rank. The rank system ensures you never claim work beyond your tier.',
  },
  {
    question: 'How does the XP and rank system work?',
    answer: 'You earn XP for every quest you complete and client accepts. As XP accumulates, your rank progresses from F to E to D to C to B to A to S. Higher ranks unlock harder, higher-paying quests. It is a transparent growth track, not a flat marketplace.',
  },
  {
    question: 'What if I start a quest and cannot finish it?',
    answer: 'Quests have defined scope, support from the Guild community, and a structured check-in process. Abandoning a quest has a cooldown penalty on claiming, not a permanent record strike - we designed the failure mode to be recoverable, because learning requires permission to struggle.',
  },
  {
    question: 'Will employers recognize my Guild Card?',
    answer: 'A Guild Card links to a live deliverable accepted by a named company or NGO client. It is a portfolio piece with a client reference built in. Employers recognize shipped work - the Guild Card is the standardized wrapper around evidence that already speaks for itself.',
  },
  {
    question: 'How and when do I get paid?',
    answer: 'Payments are processed via Razorpay after the client accepts your delivery. You can withdraw to any Indian bank account. Adventurers Guild takes a 15% platform fee - the rest is yours. Payments typically arrive within 24-48 hours of acceptance.',
  },
  {
    question: 'Is this only for web development?',
    answer: 'Currently focused on web development (React, Node.js, TypeScript, Python/Django, etc.). We are expanding to mobile and backend tracks based on quest demand. Check the quest board to see available tech stacks.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="container mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="mb-3 text-[11px] font-semibold tracking-[0.15em] text-orange-500 uppercase">
            Got questions?
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-900 md:text-4xl">
            Common questions about the Guild
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
            Everything you need to know before joining. Still have questions?{' '}
            <a href="mailto:support@adventurersguild.dev" className="text-orange-500 hover:underline">
              Email our support team
            </a>
            .
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={cn(
                  'rounded-xl border bg-white transition-all duration-200',
                  openIndex === index ? 'border-orange-200 shadow-md' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'flex-shrink-0 text-slate-400 transition-transform duration-200',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 pt-0">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2">
            <span className="text-sm text-slate-600">Still have questions?</span>
            <a
              href="mailto:support@adventurersguild.dev"
              className="text-sm font-medium text-orange-500 hover:underline"
            >
              Get in touch →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
