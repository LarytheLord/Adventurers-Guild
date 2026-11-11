import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageShell } from '@/components/public/info-page-shell';
import { buildPageMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AUDIT_AREAS, AUDIT_MAILTO } from '@/lib/audit-offer/content';
import {
  EVIDENCE_TYPES,
  SAMPLE_APP,
  SAMPLE_APP_LINE,
  SAMPLE_FINDINGS,
  SAMPLE_HONEST_NOTE,
  SAMPLE_QUOTE,
  SAMPLE_REPORT_BANNER,
  SAMPLE_REPORT_PATH,
  SAMPLE_RETEST,
  SAMPLE_RETEST_NOTE,
  SAMPLE_SUMMARY,
  SEVERITY_MEANING,
  SEVERITY_ORDER,
  quoteEffortHours,
  summaryCounts,
  type Severity,
} from '@/lib/audit-offer/sample-report';

const TITLE = 'Sample Launch Check report on a fictional app - Guild';
const DESCRIPTION =
  'See what a Launch Check report looks like: findings by area with severity, evidence, fix and effort, a fixed quote and a retest. Written for a fictional app, not a real client.';

export const metadata: Metadata = {
  ...buildPageMetadata({ path: SAMPLE_REPORT_PATH, title: TITLE, description: DESCRIPTION }),
  // The content is made up, so keep it out of search results.
  robots: { index: false, follow: true },
};

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: 'border-red-300 bg-red-50 text-red-800',
  high: 'border-orange-300 bg-orange-50 text-orange-800',
  medium: 'border-amber-300 bg-amber-50 text-amber-800',
  low: 'border-slate-300 bg-slate-50 text-slate-700',
};

const H2 = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        SEVERITY_STYLE[severity],
      )}
    >
      {severity}
    </span>
  );
}

export default function SampleReportPage() {
  const counts = summaryCounts();
  const findingById = new Map(SAMPLE_FINDINGS.map((f) => [f.id, f]));
  const quoted = SAMPLE_QUOTE.includedFindingIds.map((id) => findingById.get(id)!);

  return (
    <InfoPageShell
      eyebrow="Sample Launch Check report"
      title="What a Launch Check report looks like"
      description={`A complete example, run against ${SAMPLE_APP_LINE}.`}
      backHref="/audit"
      backLabel="Back to the Launch Check"
    >
      <div className="space-y-12 text-slate-600">
        <div
          role="note"
          className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-base font-semibold text-amber-900"
        >
          {SAMPLE_REPORT_BANNER}
        </div>

        <section id="summary" aria-labelledby="summary-title" className="space-y-4">
          <h2 id="summary-title" className={H2}>
            Summary
          </h2>
          <p className="leading-7">{SAMPLE_APP.what}</p>
          <p className="leading-7">{SAMPLE_APP.stack}</p>
          <p className="leading-7">{SAMPLE_APP.scope}</p>
          <p className="rounded-2xl border border-slate-200 bg-white p-5 font-medium leading-7 text-slate-900">
            {SAMPLE_SUMMARY.headline}
          </p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {SEVERITY_ORDER.map((s) => (
              <li key={s} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-3xl font-bold text-slate-950">{counts[s]}</p>
                <p className="mt-1 text-sm capitalize text-slate-600">{s}</p>
              </li>
            ))}
            <li className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-3xl font-bold text-slate-950">{counts.total}</p>
              <p className="mt-1 text-sm text-slate-600">Findings in total</p>
            </li>
          </ul>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Fix these first</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
                {SAMPLE_SUMMARY.fixFirst.map((id) => (
                  <li key={id}>
                    <a href={`#finding-${id}`} className="font-semibold text-orange-600 underline underline-offset-4">
                      {id}
                    </a>{' '}
                    {findingById.get(id)?.title}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">What already works</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                {SAMPLE_SUMMARY.wentWell.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="how-to-read" aria-labelledby="how-to-read-title" className="space-y-4">
          <h2 id="how-to-read-title" className={H2}>
            How to read the findings
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Severity</h3>
              <dl className="mt-3 space-y-3 text-sm leading-6">
                {SEVERITY_ORDER.map((s) => (
                  <div key={s}>
                    <dt>
                      <SeverityBadge severity={s} />
                    </dt>
                    <dd className="mt-1">{SEVERITY_MEANING[s]}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Evidence type</h3>
              <dl className="mt-3 space-y-3 text-sm leading-6">
                {Object.entries(EVIDENCE_TYPES).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-semibold capitalize text-slate-900">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <p className="text-sm leading-6">
            Effort is our estimate of working hours to fix and check one finding. It is a planning figure, not a price.
          </p>
        </section>

        <section id="findings" aria-labelledby="findings-title" className="space-y-8">
          <h2 id="findings-title" className={H2}>
            Findings by area
          </h2>
          {AUDIT_AREAS.map((area) => (
            <div key={area.id} data-area={area.id} className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{area.title}</h3>
                <p className="text-sm text-slate-500">{area.summary}</p>
              </div>
              <ul className="space-y-4">
                {SAMPLE_FINDINGS.filter((f) => f.area === area.id).map((f) => (
                  <li
                    key={f.id}
                    id={`finding-${f.id}`}
                    data-severity={f.severity}
                    className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-slate-950">{f.id}</span>
                      <SeverityBadge severity={f.severity} />
                      <span className="text-sm text-slate-500">
                        Evidence: <span className="font-semibold capitalize text-slate-700">{f.evidence}</span>
                      </span>
                      <span className="text-sm text-slate-500">
                        Effort: <span className="font-semibold text-slate-700">{f.effortHours} h</span>
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">{f.title}</h4>
                    <dl className="mt-3 space-y-3 text-sm leading-6">
                      <div>
                        <dt className="font-semibold text-slate-900">What is wrong</dt>
                        <dd>{f.what}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">What we saw</dt>
                        <dd>{f.evidenceNote}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-slate-900">Fix</dt>
                        <dd>{f.fix}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="quote" aria-labelledby="quote-title" className="space-y-4">
          <h2 id="quote-title" className={H2}>
            Fixed quote: how it is put together
          </h2>
          <p className="leading-7">
            After the Check you get one quote for the fixes. This is the shape of it, with the demo findings filled in.
          </p>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
            <dl className="space-y-3 text-sm leading-6">
              {SAMPLE_QUOTE.scope.map((s) => (
                <div key={s.label}>
                  <dt className="font-semibold text-slate-900">{s.label}</dt>
                  <dd>{s.detail}</dd>
                </div>
              ))}
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <caption className="sr-only">Findings included in the sample quote</caption>
                <thead>
                  <tr className="border-b border-slate-200 text-slate-900">
                    <th scope="col" className="py-2 pe-3 font-semibold">Finding</th>
                    <th scope="col" className="py-2 pe-3 font-semibold">Severity</th>
                    <th scope="col" className="py-2 pe-3 font-semibold">What we do</th>
                    <th scope="col" className="py-2 text-right font-semibold">Effort</th>
                  </tr>
                </thead>
                <tbody>
                  {quoted.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pe-3 font-semibold text-slate-900">{f.id}</td>
                      <td className="py-2 pe-3">
                        <SeverityBadge severity={f.severity} />
                      </td>
                      <td className="py-2 pe-3">{f.fix}</td>
                      <td className="py-2 text-right">{f.effortHours} h</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={3} className="py-2 pe-3 text-left font-semibold text-slate-900">
                      Planning estimate for the list
                    </th>
                    <td className="py-2 text-right font-semibold text-slate-900">{quoteEffortHours()} h</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Not included</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
                  {SAMPLE_QUOTE.notIncluded.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">What the price depends on</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6">
                  {SAMPLE_QUOTE.priceDependsOn.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm leading-6">
              <p>
                <span className="font-semibold text-slate-900">Price. </span>
                {SAMPLE_QUOTE.priceStatement}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Credit. </span>
                {SAMPLE_QUOTE.creditStatement}
              </p>
              <p>
                <span className="font-semibold text-slate-900">If we find more. </span>
                {SAMPLE_QUOTE.ifMoreFound}
              </p>
            </div>
          </div>
        </section>

        <section id="retest" aria-labelledby="retest-title" className="space-y-4">
          <h2 id="retest-title" className={H2}>
            Retest
          </h2>
          <p className="leading-7">
            After the fixes we repeat the original check for each finding in the quote and report what is now closed.
          </p>
          <ul className="space-y-3">
            {SAMPLE_RETEST.map((r) => (
              <li key={r.findingId} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`#finding-${r.findingId}`}
                    className="font-bold text-orange-600 underline underline-offset-4"
                  >
                    {r.findingId}
                  </a>
                  <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-800">
                    {r.status}
                  </span>
                </div>
                <p className="mt-2">
                  <span className="font-semibold text-slate-900">What we re-ran. </span>
                  {r.method}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Result. </span>
                  {r.note}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6">
            Medium and low findings are not retested unless they are added to the quote. {SAMPLE_RETEST_NOTE}
          </p>
        </section>

        <section aria-labelledby="honest-note" className="space-y-2">
          <h2 id="honest-note" className={H2}>
            An honest note
          </h2>
          <p className="leading-8">{SAMPLE_HONEST_NOTE}</p>
        </section>

        <section aria-labelledby="get-started" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="get-started" className={H2}>
            Want one for your app?
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <a href={AUDIT_MAILTO}>Request a Launch Check</a>
            </Button>
            <Link href="/audit" className="font-semibold text-orange-600 underline underline-offset-4">
              Back to the offer and prices
            </Link>
          </div>
        </section>
      </div>
    </InfoPageShell>
  );
}
