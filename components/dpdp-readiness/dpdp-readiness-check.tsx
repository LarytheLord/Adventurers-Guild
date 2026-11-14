'use client';

import { useState } from 'react';
import {
  DPDP_DISCLAIMER,
  DPDP_MAILTO,
  DPDP_QUESTIONS,
  DPDP_SOURCE_NOTE,
  DPDP_TOPIC_LABELS,
} from '@/lib/dpdp-readiness/data';
import { assessReadiness, type Answer } from '@/lib/dpdp-readiness/engine';
import { Button } from '@/components/ui/button';

// Runs entirely in the browser. Nothing is stored, sent or logged.
export function DpdpReadinessCheck() {
  const [answers, setAnswers] = useState<Record<string, Answer | undefined>>({});
  const result = assessReadiness(DPDP_QUESTIONS, answers);
  const answered = DPDP_QUESTIONS.filter((x) => answers[x.id]).length;

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Answer Yes only if you can show it today. Nothing you choose here is saved or sent anywhere.
      </p>

      <ol className="space-y-5">
        {DPDP_QUESTIONS.map((x, i) => (
          <li key={x.id}>
            <fieldset className="rounded-2xl border border-slate-200 bg-white p-5">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">
                {i + 1} of {DPDP_QUESTIONS.length} - {DPDP_TOPIC_LABELS[x.topic]} - Section {x.provision.ref} of the Act
              </legend>
              <p className="mt-1 text-base leading-6 text-slate-900">{x.question}</p>
              <div className="mt-4 flex gap-3">
                {(['yes', 'no'] as const).map((v) => {
                  const checked = answers[x.id] === v;
                  return (
                    <label
                      key={v}
                      className={
                        'flex min-h-11 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ' +
                        (checked ? 'border-orange-400 bg-orange-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-300')
                      }
                    >
                      <input
                        type="radio"
                        name={x.id}
                        value={v}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [x.id]: v }))}
                      />
                      {v === 'yes' ? 'Yes' : 'No'}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6" aria-live="polite" data-testid="dpdp-result">
        <h3 className="font-display text-xl font-bold text-slate-950">Your result</h3>
        {result ? (
          <div className="mt-3 space-y-4 text-slate-700">
            <p className="text-lg">
              <strong>{result.yes}</strong> of {result.total} answered Yes ({result.percent}%).{' '}
              {result.gaps.length === 0 ? 'No gaps found by this check.' : `${result.gaps.length} gap${result.gaps.length === 1 ? '' : 's'} to close.`}
            </p>
            {result.gaps.length > 0 ? (
              <ul className="space-y-3">
                {result.gaps.map((g) => (
                  <li key={g.id} className="rounded-xl border border-orange-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {DPDP_TOPIC_LABELS[g.topic]} - Section {g.provision.ref} of the Act
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{g.question}</p>
                    <p className="mt-2 text-sm leading-6">
                      <span className="font-semibold">Fix:</span> {g.fix}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-sm text-slate-600">{DPDP_SOURCE_NOTE}</p>
            <p className="text-sm font-semibold text-slate-900">{DPDP_DISCLAIMER}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg">
                <a href={DPDP_MAILTO}>Ask about DPDP readiness</a>
              </Button>
              <Button variant="outline" onClick={() => setAnswers({})}>
                Start again
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">
            Answer all {DPDP_QUESTIONS.length} questions to see your gaps. {answered} of {DPDP_QUESTIONS.length} done.
          </p>
        )}
      </div>
    </div>
  );
}
