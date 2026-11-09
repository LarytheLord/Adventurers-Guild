import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import {
  HOME_CONTACT,
  HOME_HERO,
  HOME_HOW,
  HOME_HOW_TITLE,
  HOME_OFFERS,
  HOME_PARTNER_NOTE,
  HOME_RESOURCES,
  HOME_RESOURCES_TITLE,
  HOME_TALENT,
} from '@/lib/home/content';

const textLink =
  'font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700';

export default function AssuranceHome() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 sm:pt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">{HOME_HERO.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">{HOME_HERO.headline}</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-700">{HOME_HERO.lead}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={HOME_HERO.primary.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white hover:bg-slate-800"
          >
            {HOME_HERO.primary.label} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={HOME_HERO.secondary.href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 px-7 text-[15px] font-semibold text-slate-900 hover:bg-slate-50"
          >
            {HOME_HERO.secondary.label}
          </Link>
        </div>
      </section>

      <section aria-labelledby="offers" className="mx-auto max-w-5xl px-6 pb-16">
        <h2 id="offers" className="sr-only">What we offer</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {HOME_OFFERS.map((o) => (
            <article key={o.id} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">{o.kicker}</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">{o.title}</h3>
              <p className="mt-3 text-slate-700">{o.body}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
                {o.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Link href={o.primary.href} className={`${textLink} inline-flex items-center gap-1.5`}>
                  {o.primary.label} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                {o.secondary && (
                  <Link href={o.secondary.href} className={textLink}>
                    {o.secondary.label}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-slate-700">
          {HOME_PARTNER_NOTE}{' '}
          <a href={HOME_CONTACT.href} className={textLink}>Email us</a>.
        </p>
      </section>

      <section aria-labelledby="how" className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 id="how" className="text-3xl font-bold tracking-tight">{HOME_HOW_TITLE}</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {HOME_HOW.map((s) => (
              <div key={s.title}>
                <dt className="text-lg font-semibold">{s.title}</dt>
                <dd className="mt-1 text-slate-700">{s.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="resources" className="mx-auto max-w-5xl px-6 py-16">
        <h2 id="resources" className="text-3xl font-bold tracking-tight">{HOME_RESOURCES_TITLE}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {HOME_RESOURCES.map((r) => (
            <li key={r.href} className="rounded-xl border border-slate-200 p-5">
              <Link href={r.href} className={textLink}>{r.label}</Link>
              <p className="mt-2 text-sm text-slate-700">{r.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="contact" className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 id="contact" className="text-3xl font-bold tracking-tight">{HOME_CONTACT.title}</h2>
          <p className="mt-3 text-slate-700">{HOME_CONTACT.body}</p>
          <a
            href={HOME_CONTACT.href}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-7 text-[15px] font-semibold text-white hover:bg-slate-800"
          >
            <Mail className="size-4" aria-hidden="true" /> {HOME_CONTACT.label}
          </a>
          <p className="mt-8 text-sm text-slate-700">
            <Link href={HOME_TALENT.href} className={textLink}>{HOME_TALENT.label}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
