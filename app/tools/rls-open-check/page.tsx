import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import {
  RLS_BUILD_STEPS,
  RLS_CI_ACTION_URL,
  RLS_CI_OPTIONS_URL,
  RLS_CI_SARIF_URL,
  RLS_DEMO_GIF_ALT,
  RLS_DEMO_GIF_URL,
  RLS_DESCRIPTION,
  RLS_EXIT_NOTE,
  RLS_GUIDE_PATH,
  RLS_LAUNCH_CHECK_PATH,
  RLS_LIMITS_LINE,
  RLS_NODE_NOTE,
  RLS_NPM_NOTE,
  RLS_PATH,
  RLS_PUBLISHED,
  RLS_REPO_URL,
  RLS_ANSWER,
  RLS_RULES,
  RLS_RULES_HEAD,
  RLS_TITLE,
  RLS_UPDATED_LABEL,
  RLS_VALIDATION,
  RLS_VALIDATION_URL,
  SRC_GUIDE,
} from '@/lib/rls-open-check-page/content';
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  path: RLS_PATH,
  title: `${RLS_TITLE} - Guild`,
  description: RLS_DESCRIPTION,
  type: 'article',
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function jsonLd() {
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: RLS_TITLE,
    description: RLS_DESCRIPTION,
    datePublished: RLS_PUBLISHED,
    dateModified: RLS_PUBLISHED,
    inLanguage: 'en-IN',
    mainEntityOfPage: absoluteUrl(RLS_PATH),
    url: absoluteUrl(RLS_PATH),
    author: org,
    publisher: org,
    citation: [
      { '@type': 'CreativeWork', name: 'rls-open-check on GitHub', url: RLS_REPO_URL },
      { '@type': 'CreativeWork', name: 'rls-open-check validation notes', url: RLS_VALIDATION_URL },
    ],
  };
}

export default function Page() {
  const v = RLS_VALIDATION;
  return (
    <InfoPageShell
      eyebrow="Free tool"
      title={RLS_TITLE}
      description={RLS_DESCRIPTION}
      updatedAt={RLS_UPDATED_LABEL}
      backHref="/guides"
      backLabel="All guides and tools"
      aside={
        <InfoPageAside title="A linter, not an audit">
          <p>It is not a penetration test and not a certification of any kind.</p>
        </InfoPageAside>
      }
    >
      <JsonLd data={jsonLd()} />
      <article className="space-y-10 text-slate-600">
        <section aria-labelledby="answer" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="answer" className="font-display text-lg font-bold text-slate-950">
            The short answer
          </h2>
          <p className="leading-7 text-slate-800">{RLS_ANSWER}</p>
        </section>

        <section aria-labelledby="rules" className="space-y-4">
          <h2 id="rules" className={h2Class}>
            What it catches
          </h2>
          <p className="leading-7">Each finding has a rule id, a severity and a one-line fix hint.</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  {RLS_RULES_HEAD.map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RLS_RULES.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-200 align-top">
                    {row.map((c, ci) => (
                      <td key={ci} className="px-4 py-3 leading-6">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="demo" className="space-y-4">
          <h2 id="demo" className={h2Class}>
            What it looks like
          </h2>
          {/* A remote GIF from the tool's repo; next/image would need a remote pattern for one file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RLS_DEMO_GIF_URL}
            alt={RLS_DEMO_GIF_ALT}
            width={800}
            height={622}
            loading="lazy"
            className="h-auto w-full rounded-2xl border border-slate-200"
          />
        </section>

        <section aria-labelledby="run" className="space-y-4">
          <h2 id="run" className={h2Class}>
            Run it today
          </h2>
          <p className="leading-7">{RLS_NODE_NOTE} Build it from source:</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-100">
            <code>{RLS_BUILD_STEPS}</code>
          </pre>
          <p className="leading-7">{RLS_EXIT_NOTE}</p>
          <p className="leading-7">{RLS_NPM_NOTE}</p>
        </section>

        <section aria-labelledby="ci" className="space-y-4">
          <h2 id="ci" className={h2Class}>
            In CI
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              <code>--fail-on &lt;level&gt;</code> exits 1 if a finding is at or above low, medium, high or critical
              (default: high). See <ExternalLink href={RLS_CI_OPTIONS_URL}>Options</ExternalLink> in the README.
            </li>
            <li>
              <code>--strict</code> also exits 1 on SQL it could not parse. Without it, parse warnings do not change
              the exit code.
            </li>
            <li>
              <code>--format sarif</code> prints a SARIF log you can upload to GitHub code scanning. See{' '}
              <ExternalLink href={RLS_CI_SARIF_URL}>SARIF and GitHub code scanning</ExternalLink>.
            </li>
          </ul>
          <p className="leading-7">
            The README also has a <ExternalLink href={RLS_CI_ACTION_URL}>GitHub Action</ExternalLink> example. It uses
            npx, so until the npm release, build from a clone as above.
          </p>
        </section>

        <section aria-labelledby="validation" className="space-y-4">
          <h2 id="validation" className={h2Class}>
            Validation and limits
          </h2>
          <p className="leading-7">
            The author ran it on {v.files} SQL files from public Supabase code and got {v.findings} findings. Of those,{' '}
            {v.readByHand} findings were read by hand: {v.truePositive} true positives, {v.unclear} unclear and{' '}
            {v.falsePositive} false positives. That is a small sample chosen to cover every rule, so read it as{' '}
            {'"no false positive found"'}, not as a rate. Details are in the{' '}
            <ExternalLink href={RLS_VALIDATION_URL}>validation notes</ExternalLink>.
          </p>
          <p className="leading-7 text-slate-800">
            <strong>{RLS_LIMITS_LINE}</strong> It is static, so it cannot see changes made in the Supabase dashboard
            or the SQL editor, and it finds a short list of common mistakes without judging what your policies mean.
          </p>
        </section>

        <section aria-labelledby="links" className="space-y-3">
          <h2 id="links" className={h2Class}>
            Links
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              <ExternalLink href={RLS_REPO_URL}>rls-open-check on GitHub</ExternalLink> (MIT)
            </li>
            <li>
              <Link href={`${RLS_GUIDE_PATH}${SRC_GUIDE}`} className={linkClass}>
                What 126 Supabase migration files taught us about RLS
              </Link>
            </li>
            <li>
              <Link href={`${RLS_LAUNCH_CHECK_PATH}${SRC_GUIDE}`} className={linkClass}>
                The free launch self-check
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </InfoPageShell>
  );
}
