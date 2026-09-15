/**
 * Money formatting. Every amount in this application is stored and passed
 * around in kobo (the smallest currency unit) — there is exactly one input
 * unit here on purpose.
 *
 * This replaces an earlier `formatPrice(koboOrNaira)` that inferred the unit
 * from magnitude (`value >= 100000 ? kobo : naira`). That silently rendered
 * any amount under ₦1,000 at 100× its real value — ₦500 (50,000 kobo)
 * displayed as "₦50,000" — which is exactly the kind of thing a customer
 * notices at checkout.
 */
export function formatKobo(kobo: number): string {
  if (!Number.isFinite(kobo)) return '₦0';
  return `₦${Math.round(kobo / 100).toLocaleString('en-NG')}`;
}
