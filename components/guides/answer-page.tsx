import Link from 'next/link';
import { Fragment } from 'react';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import {
  ANSWER_DISCLAIMER,
  type AnswerBlock,
  type AnswerPage,
  RLS_OPEN_CHECK_URL,
} from '@/lib/answer-pages/content';
import { answerPageJsonLd } from '@/lib/seo';

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(<SourceLink key={i++} href={href} label={label} />);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, idx) => (
        <Fragment key={idx}>{p}</Fragment>
      ))}
    </>
  );
}

function SourceLink({ href, label }: { href: string; label: string }) {
  return href.startsWith('/') ? (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  ) : (
    <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function BlockView({ block }: { block: AnswerBlock }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="leading-7">
          <RichText text={block.text} />
        </p>
      );
    case 'ul':
    case 'ol': {
      const Tag = block.kind;
      return (
        <Tag className={`${block.kind === 'ul' ? 'list-disc' : 'list-decimal'} space-y-2 pl-6 leading-7`}>
          {block.items.map((it) => (
            <li key={it}>
              <RichText text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-100">
          <code>{block.text}</code>
        </pre>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
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
      );
  }
}

export function AnswerPageView({ page }: { page: AnswerPage }) {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={page.title}
      description={page.description}
      updatedAt="9 November 2026"
      backHref="/guides/cert-in-ai-security-auditing-guidelines"
      backLabel="CERT-In guide"
      aside={
        <InfoPageAside title="Unofficial guide">
          <p>{ANSWER_DISCLAIMER}</p>
        </InfoPageAside>
      }
    >
      <JsonLd data={answerPageJsonLd(page)} />
      <article className="space-y-10 text-slate-600">
        <section aria-labelledby="answer" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="answer" className="font-display text-lg font-bold text-slate-950">
            The short answer
          </h2>
          <p className="leading-7 text-slate-800">{page.answer}</p>
        </section>

        {page.sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id} className="space-y-4">
            <h2 id={s.id} className={h2Class}>
              {s.heading}
            </h2>
            {s.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </section>
        ))}

        {RLS_OPEN_CHECK_URL && page.path.includes('supabase') ? (
          <section aria-labelledby="cli" className="space-y-4">
            <h2 id="cli" className={h2Class}>
              3. Automate the check
            </h2>
            <p className="leading-7">
              <SourceLink href={RLS_OPEN_CHECK_URL} label="rls-open-check" /> runs the anon-key test across your
              tables. Point it at your own project only.
            </p>
          </section>
        ) : null}

        <section aria-labelledby="sources" className="space-y-3">
          <h2 id="sources" className={h2Class}>
            Sources
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            {page.sources.map((s) => (
              <li key={s.href}>
                <SourceLink href={s.href} label={s.label} />
              </li>
            ))}
          </ul>
        </section>
      </article>
    </InfoPageShell>
  );
}
