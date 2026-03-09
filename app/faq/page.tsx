import Link from 'next/link';

export const metadata = { title: 'FAQ — Adventurers Guild' };

const faqs = [
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
  {
    q: 'How does a company post a Quest?',
    a: 'Register as a Company, go to your dashboard, and click "Post Quest". Fill in the title, description, difficulty, XP reward, and optional monetary reward. The quest goes live immediately.',
  },
  {
    q: 'How does payment work?',
    a: 'Monetary rewards are set by the company when creating a quest. Payment is handled directly between the company and the adventurer — Adventurers Guild tracks the reward amount but does not process payments in the current version.',
  },
  {
    q: 'Can multiple adventurers work on the same quest?',
    a: 'Yes. Companies can set a Max Participants count. The quest stays open in the marketplace until all slots are filled with accepted adventurers.',
  },
  {
    q: 'What happens after I submit my work?',
    a: 'The company reviews your submission and either approves it (you earn XP + reward), requests rework (you revise and resubmit), or rejects it. You can see the status on your My Quests page.',
  },
  {
    q: 'Is my code owned by me or the company?',
    a: 'This is governed by the agreement between you and the company. Adventurers Guild does not claim ownership of any work submitted through the platform.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at support@adventurersguild.space. We aim to respond within 48 hours.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-20">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <Link href="/home" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            ← Back to home
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-slate-500 text-sm mb-12">Everything you need to know about the Guild.</p>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-800 rounded-xl p-6 bg-slate-900/40">
              <h2 className="text-base font-semibold text-white mb-2">{faq.q}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">Still have questions?</p>
          <p className="text-slate-400 text-sm mt-1">
            Email us at{' '}
            <span className="text-orange-400">support@adventurersguild.space</span>
          </p>
        </div>
      </div>
    </main>
  );
}
