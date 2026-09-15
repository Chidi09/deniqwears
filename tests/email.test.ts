import { describe, it, expect, afterEach } from 'vitest';
import { sendOrderConfirmationEmail } from '../server/email/service';
import type { Order } from '../server/types';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

const mockOrder: Order = {
  id: 'ord_test_1',
  orderNumber: 'DNQ-00001',
  idempotencyKey: 'idemp-test-1',
  status: 'PAID',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      variantId: 'variant-1',
      name: 'The Amara Dress',
      color: 'Black',
      size: 'M',
      image: 'https://example.com/a.jpg',
      unitPriceInKobo: 4_800_000,
      quantity: 1,
      totalPriceInKobo: 4_800_000,
    },
  ],
  customer: { email: 'customer@example.com', firstName: 'Test', lastName: 'Customer', phone: '+2348000000000' },
  shippingAddress: {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@example.com',
    phone: '+2348000000000',
    address: '1 Test Street',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
  },
  deliveryZoneId: 'zone-lagos-island',
  deliveryFeeInKobo: 0,
  subtotalInKobo: 4_800_000,
  discountInKobo: 0,
  totalInKobo: 4_800_000,
  refundedInKobo: 0,
  currency: 'NGN',
  paymentMethod: 'paystack',
  timeline: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('sendOrderConfirmationEmail', () => {
  it('never throws when RESEND_API_KEY is missing — it logs and resolves', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(sendOrderConfirmationEmail(mockOrder)).resolves.toBeUndefined();
  });

  it('never throws even if rendering the email body fails (defensive: email must not break checkout)', async () => {
    // Configured, so it gets past the "not configured" branch and into the
    // template renderer, which will throw on a malformed order — proving
    // that failure is swallowed too, not just the missing-config case.
    process.env.RESEND_API_KEY = 'dummy-key-for-test';
    const malformedOrder = { ...mockOrder, items: null } as unknown as Order;
    await expect(sendOrderConfirmationEmail(malformedOrder)).resolves.toBeUndefined();
  });
});
