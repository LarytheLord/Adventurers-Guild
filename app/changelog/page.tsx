import type { Metadata } from 'next';
import { InfoPageShell } from '@/components/public/info-page-shell';
import {
  CHANGELOG,
  CHANGELOG_FOOTER,
  CHANGELOG_INTRO,
  formatChangelogDate,
  prLabel,
  prUrl,
} from '@/lib/changelog';
import { buildPageMetadata } from '@/lib/seo';

const TITLE = 'Changelog - Guild';
const DESCRIPTION =
  'What changed on guilds.work and in the open-source rls-open-check linter, newest first. Every line links to the merged pull request.';

export const metadata: Metadata = buildPageMetadata({
  path: '/changelog',
  title: TITLE,
  description: DESCRIPTION,
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

export default function ChangelogPage() {
  return (
    <InfoPageShell eyebrow="Changelog" title="Changelog" description={CHANGELOG_INTRO}>
      <div className="space-y-12 text-slate-600">
        {CHANGELOG.map((day) => (
          <section key={day.date} aria-labelledby={`day-${day.date}`} className="space-y-4">
            <h2 id={`day-${day.date}`} className={h2Class}>
              <time dateTime={day.date}>{formatChangelogDate(day.date)}</time>
            </h2>
            <ul className="list-disc space-y-3 pl-6 leading-7">
              {day.entries.map((entry) => (
                <li key={entry.parts.map((p) => `${p.repo}-${p.pr}`).join('_')}>
                  {entry.parts.map((part, i) => (
                    <span key={`${part.repo}-${part.pr}`}>
                      {i > 0 ? '; ' : ''}
                      {part.text}{' '}
                      <a
                        href={prUrl(part)}
                        aria-label={`${prLabel(part)}: ${part.text}, pull request on GitHub`}
                        className={linkClass}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ({prLabel(part)})
                      </a>
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="border-t border-slate-200 pt-6 text-sm leading-6">{CHANGELOG_FOOTER}</p>
      </div>
    </InfoPageShell>
  );
}
