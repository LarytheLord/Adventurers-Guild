'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Check, Swords, CalendarClock } from 'lucide-react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

// CTA targets.
// BOOKING: TODO replace with the founder's real Cal.com/Calendly link (see intake decision doc).
const EMAIL = 'abid@guilds.work';
const EMAIL_MAILTO = `mailto:${EMAIL}?subject=A%20project%20for%20Guild&body=Company%3A%0AWhat%20you%20do%3A%0AThe%20problem%20to%20solve%3A%0ARough%20budget%20/%20timeline%3A%0A`;
const BOOKING = 'https://cal.com/'; // placeholder until founder supplies the real booking link

// Outcomes a business gets, geography-neutral / Western-relevant. Plain, buyer-first.
const outcomes = [
  'A chatbot that answers customers 24/7',
  'One dashboard for revenue, ops and cash',
  'Win back customers who abandoned checkout',
  'Automate the reporting you do by hand',
  'A booking flow that fills your calendar',
  'An AI assistant trained on your docs',
  'Turn messy spreadsheets into a real system',
  'A site that turns visitors into customers',
];

// How it works. Guild concept is light flavor in the tag; the label is the plain meaning.
const flow = [
  { tag: 'Post the brief', label: 'Tell us the problem', note: 'One problem, in your words. We turn it into a fixed scope and price you approve before anything starts.' },
  { tag: 'We take it on', label: 'A senior-led team builds it', note: 'Built in your own accounts, led by one senior owner who is accountable to you.' },
  { tag: 'Proven, not promised', label: 'Reviewed before you see it', note: 'Every deliverable is checked. No raw, unreviewed work reaches you.' },
  { tag: 'It is yours', label: 'You own the system', note: 'Working software, handed over. Code and accounts are yours from day one.' },
];

const stats = [
  { v: 'Fixed', k: 'price, agreed before we start' },
  { v: '100%', k: 'you own the code and accounts' },
  { v: '1', k: 'senior owner, accountable to you' },
  { v: 'Weeks', k: 'not months, to a working system' },
];

const faqs = [
  { q: 'What if the work is not good enough?', a: 'We agree the scope and price up front, then keep working until the delivered system meets it. You sign off last.' },
  { q: 'Who actually does the work?', a: 'A senior-led, AI-augmented team. One accountable owner runs your project end to end and answers to you directly.' },
  { q: 'Do I own what you build?', a: 'Yes. Code and accounts are yours from day one. We build in your accounts. No lock-in, no rented software.' },
  { q: 'How much does it cost?', a: 'A fixed price agreed before any work starts, typically a fraction of agency cost. Book a short call and we scope it with you.' },
  { q: 'Do you work with clients outside your country?', a: 'Yes. We work remotely and in English, and you own everything we build, so location is not a barrier.' },
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
            <Swords className="size-3.5" /> A guild for your business
          </motion.div>
          <motion.h1
            initial="hidden" animate="show" custom={1} variants={fade}
            className="mt-6 text-[clamp(2.5rem,6.5vw,5.25rem)] font-black leading-[0.98] tracking-[-0.03em]"
          >
            Custom software, built for you,
            <br />
            <span className="text-slate-400">at a fraction of agency cost.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="show" custom={2} variants={fade}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-500"
          >
            Tell us the one problem slowing your business down. A senior-led, AI-augmented team
            builds the fix for a fixed price, and you own everything we ship.
          </motion.p>
          <motion.div
            initial="hidden" animate="show" custom={3} variants={fade}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a
              href={BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              <CalendarClock className="size-4" /> Book a 15-min call
            </a>
            <a
              href={EMAIL_MAILTO}
              className="inline-flex h-12 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              <Mail className="size-4" /> or email us
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

      {/* ───────── Outcomes marquee ───────── */}
      <section className="border-y border-slate-100 py-7">
        <p className="mb-5 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          What businesses ask us to build
        </p>
        <div className="relative mx-auto max-w-6xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
          <InfiniteSlider gap={16} speed={30} speedOnHover={10}>
            {outcomes.map((q) => (
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

      {/* ───────── The problem (buyer-first worldview) ───────── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <motion.h2
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
          className="text-3xl font-bold leading-snug tracking-tight sm:text-4xl"
        >
          Agencies are slow and cost a fortune.
          <br />
          <span className="text-slate-400">Freelancers vanish. AI tools you still have to run yourself.</span>
        </motion.h2>
        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }} custom={1} variants={fade}
          className="mx-auto mt-6 max-w-xl text-lg text-slate-500"
        >
          Guild is the third option. Think of it as a guild that takes on your problem, proves
          the work before you see it, and hands you a system you own outright. You bring the
          brief. We are accountable for the result.
        </motion.p>
      </section>

      {/* ───────── How it works ───────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-28">
        <div className="mb-14 max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
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
          <p className="text-[13px] font-semibold uppercase tracking-wider text-orange-600">Proof</p>
          <p className="mt-5 text-2xl font-medium leading-snug text-slate-800 sm:text-3xl">
            We run the digital and tech side of{' '}
            <a href="https://xtreamcartreatment.com" target="_blank" rel="noopener noreferrer" className="underline decoration-orange-300 underline-offset-4 hover:decoration-orange-500">
              Xtream Car Treatment
            </a>
            {' '}— real work, delivered, owned by our founder end to end.
          </p>
          <p className="mt-4 text-[14px] text-slate-400">Premium doorstep car care</p>
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
        <h2 className="text-4xl font-black tracking-tight sm:text-5xl">Tell us what to build.</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-slate-500">
          Book a short call. We will tell you exactly how we would fix your problem and what it costs.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={BOOKING}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            <CalendarClock className="size-4" /> Book a 15-min call
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
