'use client';

// Read-only render of structured field values against their definitions.
// Used to carry context through the loop: show the company's brief to the
// adventurer at submission time, and show both the brief and the structured
// submission to whoever evaluates the work (admin / PM / client).

import type { FieldDef, FieldValues } from '@/lib/quest-field-templates';

function isUrl(v: string) {
  return /^https?:\/\//i.test(v.trim());
}

interface FieldDisplayProps {
  fields: FieldDef[];
  values: FieldValues;
  /** Hide rows with no value instead of showing a dash. */
  hideEmpty?: boolean;
  className?: string;
}

export function FieldDisplay({ fields, values, hideEmpty, className }: FieldDisplayProps) {
  const rows = fields
    .map((field) => ({ field, value: values[field.key] }))
    .filter(({ value }) => {
      if (!hideEmpty) return true;
      return !(value == null || value === '' || (Array.isArray(value) && value.length === 0));
    });

  if (rows.length === 0) {
    return <p className={`text-sm text-muted-foreground ${className ?? ''}`}>No details provided.</p>;
  }

  return (
    <dl className={`divide-y divide-slate-100 ${className ?? ''}`}>
      {rows.map(({ field, value }) => (
        <div key={field.key} className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[200px_1fr] sm:gap-4">
          <dt className="text-sm font-medium text-slate-600">{field.label}</dt>
          <dd className="text-sm text-slate-900 break-words">
            {renderValue(field, value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderValue(field: FieldDef, value: FieldValues[string]) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-slate-400">—</span>;
  }
  if (field.type === 'checkbox') {
    return value === true
      ? <span className="font-medium text-emerald-600">✓ Yes</span>
      : <span className="text-slate-500">No</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.map((item, i) => (
          <li key={i}>{isUrl(String(item)) ? <ExternalLink href={String(item)} /> : String(item)}</li>
        ))}
      </ul>
    );
  }
  const str = String(value);
  if ((field.type === 'url' || isUrl(str))) return <ExternalLink href={str} />;
  return <span className="whitespace-pre-wrap">{str}</span>;
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-600 underline underline-offset-2 hover:text-sky-700 break-all"
    >
      {href}
    </a>
  );
}
