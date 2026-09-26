import Link from 'next/link';
import {
  ArrowRight,
  ShoppingBag,
  Calculator,
  BarChart3,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Clock,
  Check,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// CTA targets — kept inline for v1. Swap for a real audit form/API later.
const EMAIL = 'abid@guilds.work';
const AUDIT_MAILTO = `mailto:${EMAIL}?subject=Free%20AI%20Audit%20Request&body=Business%20name%3A%0AWhat%20we%20do%3A%0AThe%20operational%20problem%20we%20want%20fixed%3A%0A`;
const WHATSAPP = 'https://chat.whatsapp.com/FFR8bOzvsJr3xHDnhGpB95?s=cl&p=i&ilr=0';

const buckets = [
  {
    icon: ShoppingBag,
    audience: 'D2C / e-commerce brands',
    pain: 'Failed COD orders and abandoned carts quietly eat your margins.',
    solution:
      'WhatsApp automation for order confirmation, delivery follow-ups, and cart recovery.',
  },
  {
    icon: Calculator,
    audience: 'Accounting & professional firms',
    pain: 'Month-end means chasing clients for documents and matching statements by hand.',
    solution:
      'Automated document collection, reminders, and reconciliation-ready workflows.',
  },
  {
    icon: BarChart3,
    audience: 'Growing SMBs',
    pain: 'You run the business on gut feel because the numbers live in scattered sheets.',
    solution:
      'Owner dashboards for sales, inventory, cash flow, and weekly business summaries.',
  },
  {
    icon: Briefcase,
    audience: 'Agencies & consultants',
    pain: 'You win the client but lack an affordable team to execute the AI work.',
    solution:
      'A white-label execution team — you bring strategy, we build under your brand.',
  },
];

// Milestone process (replaces fixed "4-week sprint" framing with a process you can hold us to)
const steps = [
  { n: '01', title: 'Scope and sign-off', desc: 'A short call. We pin down the one workflow leaking the most time or money, and write a fixed scope and price you approve before any work starts.' },
  { n: '02', title: 'Build in the open', desc: 'A team builds in your own repository and accounts. You see progress, not a black box.' },
  { n: '03', title: 'QA and harden', desc: 'A senior Guild Master reviews and hardens every deliverable. You never see raw, unreviewed output.' },
  { n: '04', title: 'Ship and hand over', desc: 'You get a working system you own outright, with a handover. We keep fixing it until it meets the scope we both agreed.' },
];

const pricing = [
  { service: 'WhatsApp AI automation', agency: '₹2,00,000 – ₹5,50,000', guild: 'from ₹75,000' },
  { service: 'Business dashboard build', agency: '₹1,00,000+', guild: '₹25,000 – ₹75,000' },
  { service: 'Social / content, monthly', agency: '₹40,000 – ₹90,000 / mo', guild: '₹8,000 – ₹18,000 / mo' },
  { service: 'Meta / WhatsApp API markup', agency: '15% – 35% markup', guild: '0% — you pay Meta directly' },
];

const guarantees = [
  { icon: RotateCcw, title: 'We finish what we scope', desc: 'We keep working until the delivered system meets the scope we both signed. The scope and price are agreed before any work starts, so there are no surprises.' },
  { icon: Lock, title: 'You own everything', desc: 'Code and accounts are yours from day one. We build in your repository. No lock-in, no rented software.' },
  { icon: ShieldCheck, title: 'A named owner', desc: 'One senior Guild Master owns your project end to end and is accountable for quality. Not an anonymous freelancer.' },
];

export default function BusinessLanding() {
  return (
    <main className="bg-white text-slate-900">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-orange-50/60 to-white">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-orange-700">
            AI automation, delivered and owned
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Your business bottleneck,
            <br />
            <span className="text-orange-600">fixed for a fixed price.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Guild scopes the one workflow costing you the most, builds it with an
            AI-augmented team under one accountable senior owner, and hands you a working
            system you own outright. Fixed scope, fixed price, and we keep fixing it until it
            meets the brief we both signed.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={AUDIT_MAILTO}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Book a free AI audit <ArrowRight className="size-4" />
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MessageSquare className="size-4" /> Talk on WhatsApp
            </a>
          </div>
          <p className="mt-4 text-[13px] text-slate-500">
            Free, no obligation. We map the top 3 things AI can fix in your operations.
          </p>
        </div>
      </section>

      {/* ───────────── Pain buckets ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">What we build, by business</h2>
          <p className="mt-3 text-slate-600">
            We don&apos;t sell &quot;AI services.&quot; We fix one specific, expensive problem in your operations.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {buckets.map(({ icon: Icon, audience, pain, solution }) => (
            <Card key={audience} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{audience}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{pain}</p>
                <p className="mt-3 flex gap-2 text-[14px] font-medium leading-relaxed text-slate-800">
                  <Check className="mt-0.5 size-4 shrink-0 text-orange-600" />
                  {solution}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────────── First client (case story) ───────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-orange-700">
            Our first client
          </p>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-slate-900">Xtream Car Treatment</h3>
              <p className="mt-1 text-[13px] text-slate-500">
                Premium doorstep car care, Ahmedabad
              </p>
              <p className="mt-4 leading-relaxed text-slate-700">
                We handled the digital and tech side of Xtream: real, delivered work at a
                fraction of what an agency quoted, scoped and owned end to end by our founder.
                A working relationship, not a one-off. Their live site is below.
              </p>
            </div>
            <a
              href="https://xtreamcartreatment.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Visit their site <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ───────────── How it works (milestone process) ───────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">A process you can hold us to</h2>
          <p className="mt-3 text-slate-600">From your problem to a working system you own. Milestone by milestone, not open-ended retainers.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="rounded-xl border border-slate-200 bg-white p-6">
              <span className="text-[28px] font-bold text-orange-200">{n}</span>
              <h3 className="mt-2 text-[15px] font-bold">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Guarantees / risk reversal ───────────── */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">The risk is ours, not yours</h2>
            <p className="mt-3 text-slate-600">
              Hiring an unknown team is a leap of faith. We remove the reasons to say no.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {guarantees.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Pricing ───────────── */}
      <section id="pricing" className="mx-auto max-w-4xl px-6 py-20 scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">A fifth of agency cost</h2>
          <p className="mt-3 text-slate-600">
            We separate strategy, execution, and QA, so you don&apos;t pay agency overhead.
            Market figures shown for reference.
          </p>
        </div>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-slate-200 text-[12px] uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4 font-semibold">Service</th>
                <th className="py-3 pr-4 font-semibold">Typical agency</th>
                <th className="py-3 font-semibold text-orange-700">Guild</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map(({ service, agency, guild }) => (
                <tr key={service} className="border-b border-slate-100">
                  <td className="py-4 pr-4 font-medium text-slate-800">{service}</td>
                  <td className="py-4 pr-4 text-slate-500 line-through decoration-slate-300">{agency}</td>
                  <td className="py-4 font-bold text-orange-700">{guild}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
          <Clock className="size-3.5" /> Final price depends on integrations, data cleanup, and workflow complexity.
        </p>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Find out what AI can fix in your business
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Book a free 20-minute audit. We&apos;ll map the top three workflows worth automating.
            No pitch, no obligation.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={AUDIT_MAILTO}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-orange-700"
            >
              Book a free AI audit <ArrowRight className="size-4" />
            </a>
            <Link
              href="/adventurers"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              I&apos;m here to do the work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
