'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LAUNCH_ANSWERS,
  LAUNCH_AREAS,
  LAUNCH_QUESTIONS,
  checklistHref,
  findGaps,
  isComplete,
  scoreByArea,
  type Answers,
} from '@/lib/launch-check/data';
import { Button } from '@/components/ui/button';

// Runs entirely in the browser. Nothing is stored, sent or logged.
export function LaunchCheckQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const scores = scoreByArea(answers);
  const gaps = findGaps(answers);
  const complete = isComplete(answers);
  const answered = scores.reduce((n, s) => n + s.answered, 0);

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Answer for the app as it is today, not as you plan it to be. If you do not know, pick &quot;Not sure&quot;:
        it counts as a gap, because you cannot rely on something you have not checked. Nothing you choose here
        is saved or sent anywhere.
      </p>

      {LAUNCH_AREAS.map((area) => (
        <section key={area.id} aria-labelledby={`area-${area.id}`} className="space-y-4">
          <div>
            <h3 id={`area-${area.id}`} className="font-display text-xl font-bold text-slate-950">
              {area.title}
            </h3>
            <p className="text-sm text-slate-500">{area.blurb}</p>
          </div>
          {LAUNCH_QUESTIONS.filter((q) => q.area === area.id).map((q) => (
            <fieldset key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <legend className="px-1 text-base font-semibold leading-7 text-slate-900">{q.text}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {LAUNCH_ANSWERS.map((a) => {
                  const checked = answers[q.id] === a.value;
                  return (
                    <label
                      key={a.value}
                      className={
                        'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ' +
                        (checked ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300')
                      }
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={a.value}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: a.value }))}
                      />
                      <span className="text-slate-800">{a.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>
      ))}

      <div
        className="rounded-2xl border border-orange-200 bg-orange-50 p-6"
        aria-live="polite"
        data-testid="launch-result"
      >
        <h3 className="font-display text-xl font-bold text-slate-950">Your result</h3>
        {complete ? (
          <div className="mt-3 space-y-6 text-slate-700">
            <ul className="grid gap-3 sm:grid-cols-2">
              {LAUNCH_AREAS.map((area, i) => (
                <li key={area.id} className="rounded-xl border border-orange-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{area.title}</p>
                  <p className="text-lg">
                    <strong>{scores[i].yes}</strong> of {scores[i].total} checked
                  </p>
                </li>
              ))}
            </ul>

            {gaps.length === 0 ? (
              <p>
                You answered yes to all 20. That means you say you have checked them; it does not prove they
                are right. A second pair of eyes is the way to find out.
              </p>
            ) : (
              <div className="space-y-3">
                <h4 className="font-display text-lg font-bold text-slate-950">
                  Your gaps ({gaps.length})
                </h4>
                <ul className="space-y-3">
                  {gaps.map((q) => (
                    <li key={q.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6">
                      <p className="font-semibold text-slate-900">{q.text}</p>
                      <p className="mt-1">
                        <span className="font-semibold">Fix:</span> {q.fix}
                      </p>
                      <p className="mt-1">
                        <Link
                          href={checklistHref(q)}
                          className="font-semibold text-orange-700 underline underline-offset-4"
                        >
                          See this on the checklist
                        </Link>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg">
                <Link href="/audit">Have us check your app</Link>
              </Button>
              <Button variant="outline" onClick={() => setAnswers({})}>
                Start again
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">
            Answer all 20 questions to see your result. {answered} of {LAUNCH_QUESTIONS.length} done.
          </p>
        )}
      </div>
    </div>
  );
}
