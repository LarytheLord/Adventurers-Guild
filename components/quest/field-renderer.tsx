'use client';

// Renders a list of FieldDef as form inputs bound to a values object.
// Reused by the quest brief form (company) and the submission form (adventurer)
// so both sides of the loop stay perfectly in sync with the template.

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FieldDef, FieldValue, FieldValues } from '@/lib/quest-field-templates';

interface FieldRendererProps {
  fields: FieldDef[];
  values: FieldValues;
  onChange: (key: string, value: FieldValue) => void;
  idPrefix?: string;
  disabled?: boolean;
}

export function FieldRenderer({ fields, values, onChange, idPrefix = 'f', disabled }: FieldRendererProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const id = `${idPrefix}-${field.key}`;
        const raw = values[field.key];

        if (field.type === 'checkbox') {
          return (
            <div key={field.key} className="flex items-start gap-2">
              <Checkbox
                id={id}
                checked={raw === true}
                onCheckedChange={(v) => onChange(field.key, v === true)}
                disabled={disabled}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor={id} className="cursor-pointer">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </Label>
                {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
              </div>
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={id}>
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </Label>

            {field.type === 'textarea' && (
              <Textarea
                id={id}
                rows={4}
                placeholder={field.placeholder}
                value={typeof raw === 'string' ? raw : ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={disabled}
              />
            )}

            {field.type === 'list' && (
              <Textarea
                id={id}
                rows={3}
                placeholder={field.placeholder ?? 'One item per line'}
                value={Array.isArray(raw) ? raw.join('\n') : ''}
                onChange={(e) =>
                  onChange(
                    field.key,
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                  )
                }
                disabled={disabled}
              />
            )}

            {field.type === 'select' && (
              <Select
                value={typeof raw === 'string' ? raw : ''}
                onValueChange={(v) => onChange(field.key, v)}
                disabled={disabled}
              >
                <SelectTrigger id={id}>
                  <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(field.type === 'text' || field.type === 'url' || field.type === 'number') && (
              <Input
                id={id}
                type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                placeholder={field.placeholder}
                value={raw == null ? '' : String(raw)}
                onChange={(e) =>
                  onChange(field.key, field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)
                }
                disabled={disabled}
              />
            )}

            {field.type !== 'list' && field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
            {field.type === 'list' && (
              <p className="text-xs text-muted-foreground">{field.helpText ?? 'One item per line.'}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
