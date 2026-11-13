import { formatChartCurrency, formatChartDate } from '@/lib/chart-formatters';

describe('chart tooltip formatters', () => {
  it('formats numeric revenue, including zero', () => {
    const currency = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    expect(formatChartCurrency(1234, 'INR')).toBe(currency.format(1234));
    expect(formatChartCurrency(0, 'INR')).toBe(currency.format(0));
  });

  it.each([undefined, null, '1234', [1234], NaN, Infinity])(
    'does not display unsupported revenue as money: %p',
    (value) => {
      expect(formatChartCurrency(value, 'INR')).toBe('-');
    }
  );

  it('formats date strings and timestamps', () => {
    const date = new Date(2026, 0, 15, 12);
    expect(formatChartDate(date.toISOString())).toBe('Jan 15, 2026');
    expect(formatChartDate(date.getTime())).toBe('Jan 15, 2026');
  });

  it.each([undefined, null, false, {}, 'invalid-date', NaN])(
    'does not throw for unsupported date labels: %p',
    (value) => {
      expect(formatChartDate(value)).toBe('');
    }
  );
});
