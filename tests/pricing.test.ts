import { describe, it, expect } from 'vitest';
import {
  calculateDeliveryFeeInKobo,
  calculateDiscountInKobo,
  calculateOrderTotalInKobo,
} from '../server/pricing';

describe('calculateDeliveryFeeInKobo', () => {
  it('charges the zone fee when below the free-delivery threshold', () => {
    expect(calculateDeliveryFeeInKobo(5_000_000, 10_000_000, 450_000)).toBe(450_000);
  });

  it('is free once the subtotal meets the threshold', () => {
    expect(calculateDeliveryFeeInKobo(10_000_000, 10_000_000, 450_000)).toBe(0);
  });

  it('is free once the subtotal exceeds the threshold', () => {
    expect(calculateDeliveryFeeInKobo(20_000_000, 10_000_000, 450_000)).toBe(0);
  });
});

describe('calculateDiscountInKobo', () => {
  it('applies a percentage discount', () => {
    expect(
      calculateDiscountInKobo(10_000_000, { type: 'percentage', value: 10, minSpendInKobo: null })
    ).toBe(1_000_000);
  });

  it('applies a fixed discount', () => {
    expect(
      calculateDiscountInKobo(10_000_000, { type: 'fixed', value: 500_000, minSpendInKobo: null })
    ).toBe(500_000);
  });

  it('caps a fixed discount at the subtotal so total never goes negative', () => {
    expect(
      calculateDiscountInKobo(300_000, { type: 'fixed', value: 500_000, minSpendInKobo: null })
    ).toBe(300_000);
  });

  it('returns zero when the subtotal is below the minimum spend', () => {
    expect(
      calculateDiscountInKobo(1_000_000, { type: 'percentage', value: 10, minSpendInKobo: 3_000_000 })
    ).toBe(0);
  });

  it('applies the discount when the subtotal meets the minimum spend exactly', () => {
    expect(
      calculateDiscountInKobo(3_000_000, { type: 'percentage', value: 10, minSpendInKobo: 3_000_000 })
    ).toBe(300_000);
  });

  it('rounds a percentage discount to the nearest kobo', () => {
    expect(
      calculateDiscountInKobo(999_999, { type: 'percentage', value: 10, minSpendInKobo: null })
    ).toBe(100_000); // 99,999.9 rounds to 100,000
  });
});

describe('calculateOrderTotalInKobo', () => {
  it('sums subtotal + delivery - discount', () => {
    expect(calculateOrderTotalInKobo(10_000_000, 450_000, 1_000_000)).toBe(9_450_000);
  });

  it('floors at zero rather than going negative', () => {
    expect(calculateOrderTotalInKobo(300_000, 0, 500_000)).toBe(0);
  });
});
