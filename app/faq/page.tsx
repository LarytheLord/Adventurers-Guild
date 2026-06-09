import { Mail, ShieldCheck, Sword, Trophy } from 'lucide-react';
import {
  InfoPageAside,
  InfoPageProse,
  InfoPageShell,
} from '@/components/public/info-page-shell';

export const metadata = { title: 'FAQ - Guild' };

const faqs = [
  {
    q: 'What is Guild?',
    a: 'Guild is a quest-based marketplace for developers. Companies post coding tasks and adventurers complete them to earn XP, rank up from F to S, and get paid.',
  },
  {
    q: 'How do I start earning XP?',
    a: 'Register as an Adventurer, browse the Quest board, apply to quests that match your skills, and complete them. XP is awarded when a company approves your submission.',
  },
  {
    q: 'What are the ranks?',
    a: 'Ranks run from F up to S: F, E, D, C, B, A, S. Each rank unlocks harder quests and gives companies a clearer signal about your delivery history.',
  },
  {
    q: 'How does a company post a Quest?',
    a: 'Register as a Company, open the dashboard, and use Post Quest. Add the title, description, difficulty, XP reward, and optional cash reward, then publish it.',
  },
  {
    q: 'How does payment work?',
    a: 'Monetary rewards are set by the company when creating a quest. Guild tracks the reward, while payout and approval flow follow the company-adventurer agreement in the current version.',
  },
  {
    q: 'Can multiple adventurers work on the same quest?',
    a: 'Yes. Companies can set a maximum participant count, and the quest remains open until all accepted slots are filled.',
  },
  {
    q: 'What happens after I submit my work?',
    a: 'The company reviews your submission and can approve it, request rework, or reject it. You can track the outcome and next steps from your quest pipeline.',
  },
  {
    q: 'Is my code owned by me or the company?',
    a: 'Ownership depends on the agreement between you and the company. Guild itself does not claim ownership of submitted work.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email support@adventurersguild.space and we aim to reply within 48 hours.',
  },
];

const quickPoints = [
  {
    icon: Sword,
    title: 'For adventurers',
    body: 'Pick real quests, ship useful work, and let XP reflect the proof.',
  },
  {
    icon: Trophy,
    title: 'For companies',
    body: 'Source contributors through visible track records instead of resumes alone.',
  },
  {
    icon: ShieldCheck,
    title: 'For trust',
    body: 'Ranks, reviews, and quest history work together as the signal system.',
  },
];

export default function FaqPage() {
  return (
    <InfoPageShell
      eyebrow="FAQ"
      title="Answers that sound like the same Guild the rest of the site promises."
      description="Everything people usually want to know before they join, post work, or start building a reputation through real delivery."
      aside={
        <>
          <InfoPageAside title="Quick Read">
            {quickPoints.map((point) => (
              <div key={point.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <point.icon className="h-4 w-4 text-orange-500" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{point.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{point.body}</p>
              </div>
            ))}
          </InfoPageAside>
          <InfoPageAside title="Need Help">
            <div className="inline-flex items-center gap-2 text-slate-900">
              <Mail className="h-4 w-4 text-orange-500" />
              support@adventurersguild.space
            </div>
            <p>Reach out if you want help with onboarding, quest flow, or a company setup question.</p>
          </InfoPageAside>
        </>
      }
    >
      <InfoPageProse>
        <div className="grid gap-4">
          {faqs.map((faq) => (
            <section
              key={faq.q}
              className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-6 transition-colors hover:bg-white"
            >
              <h2 className="text-xl font-semibold text-slate-950">{faq.q}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
            </section>
          ))}
        </div>
      </InfoPageProse>
    </InfoPageShell>
  );
}
