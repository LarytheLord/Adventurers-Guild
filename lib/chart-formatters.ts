import { format } from 'date-fns';

export function formatChartCurrency(value: unknown, currency: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatChartDate(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : format(date, 'MMM dd, yyyy');
}
