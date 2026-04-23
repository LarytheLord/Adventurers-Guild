'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export const metadata = { title: 'FAQ — Adventurers Guild' };

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: 'What is Adventurers Guild?',
        a: 'Adventurers Guild is a quest-based marketplace for developers. Companies post coding tasks (Quests) and developers (Adventurers) complete them to earn XP, rank up from F to S, and get paid.',
      },
      {
        q: 'How do I start earning XP?',
        a: 'Register as an Adventurer, browse the Quest board, apply to quests that match your skills, and complete them. XP is awarded automatically when a company approves your submission.',
      },
      {
        q: 'What are the ranks?',
        a: 'Ranks run from F (starting) up to S (elite): F → E → D → C → B → A → S. Each rank unlocks higher-difficulty quests and signals your experience level to companies.',
      },
    ],
  },
  {
    category: 'Companies',
    items: [
      {
        q: 'How does a company post a Quest?',
        a: 'Register as a Company, go to your dashboard, and click "Post Quest". Fill in the title, description, difficulty, XP reward, and optional monetary reward.',
      },
      {
        q: 'Can multiple adventurers work on the same quest?',
        a: 'Yes. Companies can set a Max Participants count. The quest stays open until all slots are filled.',
      },
    ],
  },
  {
    category: 'Payments & Ownership',
    items: [
      {
        q: 'How does payment work?',
        a: 'Payments are set by companies. Currently, Adventurers Guild tracks rewards but does not process payments.',
      },
      {
        q: 'Is my code owned by me or the company?',
        a: 'Ownership depends on your agreement with the company. The platform does not claim ownership.',
      },
    ],
  },
  {
    category: 'Submissions',
    items: [
      {
        q: 'What happens after I submit my work?',
        a: 'The company reviews your submission and either approves it, requests rework, or rejects it. Status is visible in My Quests.',
      },
    ],
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-4xl mx-auto px-6">
        {/* Back */}
        <div className="mb-10">
          <Link
            href="/home"
            className="text-sm text-slate-500 hover:text-orange-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-white mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 text-sm mb-12">
          Everything you need to know about the Guild.
        </p>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqs.map((section, sIndex) => (
            <div key={sIndex}>
              <h2 className="text-lg font-semibold text-orange-400 mb-4">
                {section.category}
              </h2>

              <div className="space-y-4">
                {section.items.map((faq, i) => {
                  const id = `${sIndex}-${i}`;
                  const isOpen = openIndex === id;

                  return (
                    <div
                      key={id}
                      className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden"
                    >
                      {/* Question */}
                      <button
                        onClick={() => toggle(id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/40 transition"
                      >
                        <span className="text-white font-medium text-sm">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            isOpen ? 'rotate-180 text-orange-400' : 'text-slate-500'
                          }`}
                        />
                      </button>

                      {/* Answer */}
                      <div
                        className={`px-5 transition-all duration-300 ease-in-out ${
                          isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                        } overflow-hidden`}
                      >
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 text-center border-t border-slate-800 pt-10">
          <p className="text-slate-500 text-sm">Still have questions?</p>
          <p className="text-slate-400 text-sm mt-1">
            Email us at{' '}
            <span className="text-orange-400">
              support@adventurersguild.space
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}