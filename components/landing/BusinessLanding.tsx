'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Check, Swords } from 'lucide-react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

// CTA targets. WHATSAPP: TODO swap to the dedicated Guild client-intake WhatsApp (see to-do).
const EMAIL = 'abid@guilds.work';
const AUDIT_MAILTO = `mailto:${EMAIL}?subject=A%20quest%20for%20Guild&body=Business%3A%0AWhat%20we%20do%3A%0AThe%20quest%20(the%20problem%20to%20solve)%3A%0A`;
const WHATSAPP = 'https://chat.whatsapp.com/FFR8bOzvsJr3xHDnhGpB95?s=cl&p=i&ilr=0';

// Real business problems, framed as "quests" (the soul: you post a quest, the guild takes it).
const quests = [
  'Confirm every COD order on WhatsApp',
  'One dashboard for sales, stock and cash',
  'Win back every abandoned cart',
  'Turn our bills into Tally-ready data',
  'A booking flow that fills the calendar',
  'An AI assistant trained on our SOPs',
  'Chase a review after every job',
  'A landing page that actually converts',
];

// The loop, told as the guild story: post -> claimed -> proven -> yours.
const flow = [
  { tag: 'Post the quest', label: 'Tell us what to fix', note: 'One problem, in your words. We turn it into a fixed scope and price you sign first.' },
  { tag: 'The Guild takes it', label: 'A ranked team builds', note: 'Built in your own repo, led by one senior Guild Master who owns it.' },
  { tag: 'Proven, not promised', label: 'QA before you ever see it', note: 'Every deliverable is checked. No raw, unreviewed work reaches you.' },
  { tag: 'Claim the reward', label: 'You own the system', note: 'Working software, handed over. Code and accounts are yours from day one.' },
];

const stats = [
  { v: 'Fixed', k: 'price, agreed before we start' },
  { v: '100%', k: 'you own the code' },
  { v: '1', k: 'named Guild Master per quest' },
  { v: '1/5', k: 'of typical agency cost' },
];

const faqs = [
  { q: 'What if the work is not good enough?', a: 'We agree the scope and price up front, then keep working until the delivered system meets it. You sign off last.' },
  { q: 'Who actually does the work?', a: 'A ranked, AI-augmented team, led end to end by a senior Guild Master who owns quality and answers to you directly.' },
  { q: 'Do I own what you build?', a: 'Yes. Code and accounts are yours from day one. We build in your repository. No lock-in, no rented software.' },
  { q: 'What does a quest cost?', a: 'A fixed price agreed before any work starts, typically around a fifth of agency cost. Message us with the problem and we scope it.' },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

export default function BusinessLanding() {
  return (
    <main className="bg-white text-slate-900">
      {/* ───────── Hero ───────── */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-200/40 blur-[130px]" />
        </div>
        <div className="mx-auto w-full max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden" animate="show" variants={fade}
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50/70 px-4 py-1.5 text-[13px] font-medium text-orange-700"
          >
            <Swords className="size-3.5" /> A guild for your business, not a guessing-game agency
          </motion.div>
          <motion.h1
            initial="hidden" animate="show" custom={1} variants={fade}
            className="mt-6 text-[clamp(2.6rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.03em]"
          >
            You have a quest.
            <br />
            <span className="text-slate-400">We take it on.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="show" custom={2} variants={fade}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-500"
          >
            Every business has one thing quietly costing it time or money. Tell us that one
            thing. A ranked, AI-augmented team builds the fix for a fixed price, and you own it.
          </motion.p>
          <motion.div
            initial="hidden" animate="show" custom={3} variants={fade}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              <MessageSquare className="size-4" /> Post your quest on WhatsApp
            </a>
            <a
              href={AUDIT_MAILTO}
              className="inline-flex h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              or email it <ArrowRight className="size-4" />
            </a>
          </motion.div>
          <motion.p
            initial="hidden" animate="show" custom={4} variants={fade}
            className="mt-5 text-[13px] text-slate-400"
          >
            Fixed price, agreed first. You own everything. We keep going until it works.
          </motion.p>
        </div>
      </section>

      {/* ───────── Quest marquee ───────── */}
      <section className="border-y border-slate-100 py-7">
        <p className="mb-5 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Quests businesses hand us
        </p>
        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
          <InfiniteSlider gap={16} speed={30} speedOnHover={10}>
            {quests.map((q) => (
              <span
                key={q}
                className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] text-slate-600"
              >
                <span className="size-1.5 rounded-full bg-orange-400" />
                {q}
              </span>
            ))}
          </InfiniteSlider>
        </div>
      </section>

      {/* ───────── The problem (direction / worldview) ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl"
        >
          Agencies are slow and cost a fortune.
          <br />
          <span className="text-slate-400">Freelancers vanish. AI tools you have to run yourself.</span>
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={fade}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-500"
        >
          Guild is the third option: a trusted guild that takes on your problem, proves the
          work before you see it, and hands you something you own. You post the quest. We are
          accountable for the result.
        </motion.p>
      </section>

      {/* ───────── How it works (the guild loop) ───────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-28">
        <div className="mb-14 max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How a quest works</h2>
          <p className="mt-3 text-slate-500">Four steps, from your problem to a system you own.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((s, i) => (
            <motion.div
              key={s.tag}
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }}
              custom={i} variants={fade}
              className="rounded-2xl border border-slate-200 p-6 transition-colors hover:border-orange-300 hover:shadow-[0_18px_40px_-30px_rgba(15,23,42,0.4)]"
            >
              <span className="text-[12px] font-semibold uppercase tracking-wider text-orange-600">
                {String(i + 1).padStart(2, '0')} · {s.tag}
              </span>
              <h3 className="mt-3 text-lg font-bold">{s.label}</h3>
              <p className="mt-2 flex gap-2 text-[14px] leading-relaxed text-slate-500">
                <Check className="mt-0.5 size-4 shrink-0 text-orange-500" />
                {s.note}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────── Stats ───────── */}
      <section id="pricing" className="border-y border-slate-100 bg-slate-50/60 scroll-mt-24">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-16 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.k}
              initial="hidden" whileInView="show" viewport={{ once: true }}
              custom={i} variants={fade}
              className="text-center"
            >
              <div className="text-4xl font-black tracking-tight sm:text-5xl">{s.v}</div>
              <div className="mt-1 text-[13px] text-slate-500">{s.k}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────── Proof (Xtream) ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-orange-600">The first quest</p>
          <p className="mt-5 text-2xl font-medium leading-snug text-slate-800 sm:text-3xl">
            We run the digital and tech side of{' '}
            <a href="https://xtreamcartreatment.com" target="_blank" rel="noopener noreferrer" className="underline decoration-orange-300 underline-offset-4 hover:decoration-orange-500">
              Xtream Car Treatment
            </a>
            {' '}— real work, delivered, owned by our founder end to end.
          </p>
          <p className="mt-4 text-[14px] text-slate-400">Premium doorstep car care, Ahmedabad</p>
        </motion.div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">The questions everyone asks</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <motion.details
                key={f.q}
                initial="hidden" whileInView="show" viewport={{ once: true }} custom={i} variants={fade}
                className="group rounded-2xl border border-slate-200 bg-white p-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span className="text-orange-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{f.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">What is your quest?</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-slate-500">
          Send us the one thing slowing your business down. We will tell you exactly how we would fix it.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            <MessageSquare className="size-4" /> Post your quest on WhatsApp
          </a>
          <Link
            href="/adventurers"
            className="inline-flex h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            I want to do the work <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
