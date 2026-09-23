/**
 * Money formatting. The store trades in US dollars and every amount is stored
 * and passed around in cents, the smallest currency unit. (Fields keep their
 * historical `…InKobo` names because they map to database columns; the unit
 * is simply the currency's minor unit.) There is exactly one input unit here
 * on purpose.
 *
 * This replaces an earlier formatter that inferred the unit from magnitude,
 * which silently rendered small amounts at 100× their real value — exactly the
 * kind of thing a customer notices at checkout.
 */
export const STORE_CURRENCY = 'USD' as const;
export const STORE_LOCALE = 'en-US';

const wholeDollars = new Intl.NumberFormat(STORE_LOCALE, {
  style: 'currency',
  currency: STORE_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const withCents = new Intl.NumberFormat(STORE_LOCALE, { style: 'currency', currency: STORE_CURRENCY });

/** $128 for whole-dollar amounts, $7.95 otherwise. */
export function formatMoney(cents: number): string {
  if (!Number.isFinite(cents)) return wholeDollars.format(0);
  const rounded = Math.round(cents);
  return rounded % 100 === 0 ? wholeDollars.format(rounded / 100) : withCents.format(rounded / 100);
}
