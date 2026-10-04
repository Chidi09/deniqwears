import { DiscountCode } from './types';

/**
 * Delivery fee in cents. Shipping is compulsory: the selected zone's flat fee is
 * always charged, with no free-shipping threshold or other exception.
 */
export function calculateDeliveryFeeInKobo(zoneFeeInKobo: number): number {
  return zoneFeeInKobo;
}

/**
 * Discount in kobo for a subtotal against a given code. Returns 0 if the
 * code doesn't meet its minimum spend — callers should only invoke this
 * after confirming the code is active and matches (see db.getDiscount).
 */
export function calculateDiscountInKobo(
  subtotalInKobo: number,
  discount: Pick<DiscountCode, 'type' | 'value' | 'minSpendInKobo'>
): number {
  if (discount.minSpendInKobo && subtotalInKobo < discount.minSpendInKobo) return 0;

  if (discount.type === 'percentage') {
    return Math.round((subtotalInKobo * discount.value) / 100);
  }
  return Math.min(discount.value, subtotalInKobo);
}

/** Final order total in kobo, floored at zero. */
export function calculateOrderTotalInKobo(
  subtotalInKobo: number,
  deliveryFeeInKobo: number,
  discountInKobo: number
): number {
  return Math.max(0, subtotalInKobo + deliveryFeeInKobo - discountInKobo);
}
