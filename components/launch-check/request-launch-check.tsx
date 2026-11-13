'use client';

import { useState, type FormEvent } from 'react';
import {
  BUILDERS,
  CONSENT_LABEL,
  FREE_OFFER_LINE,
  NEXT_STEPS,
  REQUEST_MAIL_TO,
  buildRequestMailto,
  type RequestErrors,
  type RequestInput,
} from '@/lib/audit-offer/request';
import { Button } from '@/components/ui/button';

const EMPTY: RequestInput = { appUrl: '', builder: '', whatItDoes: '', payments: '', email: '', consent: false };

const FIELD = 'mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900';

// Opens the founder's own mail app with a prefilled email. Nothing is stored or sent by us.
export function RequestLaunchCheck({ headingId = 'request-launch-check' }: { headingId?: string }) {
  const [values, setValues] = useState<RequestInput>(EMPTY);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [opened, setOpened] = useState(false);

  const set = <K extends keyof RequestInput>(key: K, value: RequestInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = buildRequestMailto(values);
    if (!result.ok) {
      setErrors(result.errors);
      setOpened(false);
      return;
    }
    setErrors({});
    setOpened(true);
    window.location.href = result.href;
  }

  const err = (key: keyof RequestInput) =>
    errors[key] ? (
      <span id={`rlc-${key}-err`} role="alert" className="mt-1 block text-sm text-red-700">
        {errors[key]}
      </span>
    ) : null;
  const describe = (key: keyof RequestInput) => (errors[key] ? `rlc-${key}-err` : undefined);

  return (
    <section aria-labelledby={headingId} className="space-y-6 rounded-2xl bg-orange-50 p-6">
      <div className="space-y-2">
        <h2 id={headingId} className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
          Request a Launch Check
        </h2>
        <p className="font-semibold text-slate-900">{FREE_OFFER_LINE}.</p>
        <p>Fill in five short fields. Your email app opens with the details filled in, and you press send.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4 text-slate-800">
        <label className="block text-sm font-semibold">
          App URL
          <input
            type="url"
            className={FIELD}
            value={values.appUrl}
            onChange={(e) => set('appUrl', e.target.value)}
            placeholder="https://your-app.example.com"
            aria-invalid={!!errors.appUrl}
            aria-describedby={describe('appUrl')}
          />
          {err('appUrl')}
        </label>

        <label className="block text-sm font-semibold">
          Built with
          <select
            className={FIELD}
            value={values.builder}
            onChange={(e) => set('builder', e.target.value as RequestInput['builder'])}
            aria-invalid={!!errors.builder}
            aria-describedby={describe('builder')}
          >
            <option value="">Choose one</option>
            {BUILDERS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {err('builder')}
        </label>

        <label className="block text-sm font-semibold">
          What the app does
          <textarea
            className={FIELD}
            rows={3}
            value={values.whatItDoes}
            onChange={(e) => set('whatItDoes', e.target.value)}
            aria-invalid={!!errors.whatItDoes}
            aria-describedby={describe('whatItDoes')}
          />
          {err('whatItDoes')}
        </label>

        <fieldset className="text-sm">
          <legend className="font-semibold">Does the app take payments?</legend>
          <div className="mt-1 flex gap-3">
            {(['yes', 'no'] as const).map((p) => (
              <label key={p} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4">
                <input
                  type="radio"
                  name="rlc-payments"
                  value={p}
                  checked={values.payments === p}
                  onChange={() => set('payments', p)}
                />
                {p === 'yes' ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
          {err('payments')}
        </fieldset>

        <label className="block text-sm font-semibold">
          Your email
          <input
            type="email"
            className={FIELD}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={describe('email')}
          />
          {err('email')}
        </label>

        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={values.consent}
              onChange={(e) => set('consent', e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={describe('consent')}
            />
            <span>{CONSENT_LABEL}</span>
          </label>
          {err('consent')}
        </div>

        <Button type="submit" size="lg">
          Request a Launch Check
        </Button>
        {opened ? (
          <p role="status" className="text-sm text-slate-700">
            Your email app should now be open. If nothing opened, email us at {REQUEST_MAIL_TO} with the same
            details.
          </p>
        ) : null}
      </form>

      <div className="space-y-2">
        <h3 className="font-display text-xl font-bold text-slate-950">What happens next</h3>
        <ul className="list-disc space-y-1 pl-6 leading-7">
          {NEXT_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
