'use client';

import { useState } from 'react';
import {
  AI_RISK_ESCALATION_NOTE,
  AI_RISK_FACTORS,
  AI_RISK_SCORES,
  AI_RISK_TIERS,
  AI_RISK_TIER_MAILTO,
  compositeScore,
  tierForScore,
  type FactorId,
} from '@/lib/ai-risk-tier/data';
import { Button } from '@/components/ui/button';

// Runs entirely in the browser. Nothing is stored, sent or logged.
export function RiskTierCalculator() {
  const [scores, setScores] = useState<Partial<Record<FactorId, number>>>({});
  const total = compositeScore(scores);
  const tier = total === null ? null : tierForScore(total);
  const answered = Object.keys(scores).length;

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Score one AI system at a time. Score the inherent risk, without taking credit for controls you
        believe work. Nothing you choose here is saved or sent anywhere.
      </p>

      <div className="space-y-5">
        {AI_RISK_FACTORS.map((f) => (
          <fieldset key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <legend className="px-1 text-base font-semibold text-slate-900">
              {f.id}: {f.name}
            </legend>
            <p className="mt-1 text-sm leading-6 text-slate-600">{f.question}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {AI_RISK_SCORES.map((s, i) => {
                const checked = scores[f.id] === s.value;
                return (
                  <label
                    key={s.value}
                    className={
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 ' +
                      (checked ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-slate-300')
                    }
                  >
                    <input
                      type="radio"
                      name={f.id}
                      value={s.value}
                      checked={checked}
                      onChange={() => setScores((prev) => ({ ...prev, [f.id]: s.value }))}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-semibold text-slate-900">
                        {s.label} ({s.value})
                      </span>
                      <span className="block text-slate-600">{f.levels[i]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {f.note ? <p className="mt-3 text-xs text-slate-500">Guideline note: {f.note}</p> : null}
          </fieldset>
        ))}
      </div>

      <div
        className="rounded-2xl border border-orange-200 bg-orange-50 p-6"
        aria-live="polite"
        data-testid="tier-result"
      >
        <h3 className="font-display text-xl font-bold text-slate-950">Your result</h3>
        {tier && total !== null ? (
          <div className="mt-3 space-y-3 text-slate-700">
            <p className="text-lg">
              Composite score <strong>{total}</strong> out of 32: <strong>Tier {tier.tier} ({tier.label})</strong>.
            </p>
            <p>
              <span className="font-semibold">Minimum audit requirement (Table 11):</span> {tier.requirement}
            </p>
            <p className="text-sm text-slate-500">{AI_RISK_ESCALATION_NOTE}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button asChild size="lg">
                <a href={AI_RISK_TIER_MAILTO}>Ask about audit readiness</a>
              </Button>
              <Button variant="outline" onClick={() => setScores({})}>
                Start again
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">
            Answer all eight factors to see the score. {answered} of {AI_RISK_FACTORS.length} done.
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Composite scores, tiers and minimum audit requirements</caption>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="p-3">Score</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Minimum audit requirement</th>
            </tr>
          </thead>
          <tbody>
            {AI_RISK_TIERS.map((t) => (
              <tr key={t.tier} className={'border-t border-slate-100 align-top ' + (tier?.tier === t.tier ? 'bg-orange-50' : '')}>
                <td className="p-3 whitespace-nowrap">
                  {t.min} to {t.max}
                </td>
                <td className="p-3 whitespace-nowrap">
                  Tier {t.tier} ({t.label})
                </td>
                <td className="p-3">{t.requirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
