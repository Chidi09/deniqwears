import { describe, it, expect, afterEach } from 'vitest';
import crypto from 'node:crypto';
import { PaystackProvider, FlutterwaveProvider, ShowroomCollectionProvider } from '../server/payment/providers';
import { PaymentProviderNotConfiguredError } from '../server/payment/types';
import type { Order } from '../server/types';

const mockOrder: Order = {
  id: 'ord_test_1',
  orderNumber: 'DNQ-00001',
  idempotencyKey: 'idemp-test-1',
  status: 'PENDING_PAYMENT',
  items: [],
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
  subtotalInKobo: 1_000_000,
  discountInKobo: 0,
  totalInKobo: 1_000_000,
  refundedInKobo: 0,
  currency: 'NGN',
  paymentMethod: 'paystack',
  timeline: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('PaystackProvider', () => {
  it('throws PaymentProviderNotConfiguredError instead of faking success when no secret key is set', async () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    const provider = new PaystackProvider();
    await expect(provider.initializePayment(mockOrder)).rejects.toBeInstanceOf(PaymentProviderNotConfiguredError);
  });

  it('initializes a real payment session against the (mocked) Paystack API when configured', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock';
    const provider = new PaystackProvider();
    const session = await provider.initializePayment(mockOrder);
    expect(session.provider).toBe('paystack');
    expect(session.authorizationUrl).toContain('checkout.paystack.com/mock');
    expect(session.amountInKobo).toBe(mockOrder.totalInKobo);
  });

  it('verifies a reference it initialized, echoing back the exact amount charged', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock';
    const provider = new PaystackProvider();

    const session = await provider.initializePayment(mockOrder);
    const result = await provider.verifyPayment(session.reference);

    expect(result.success).toBe(true);
    expect(result.status).toBe('success');
    // The amount must come back intact — PaymentService compares it to the
    // order total, so a mock returning 0 would mask a real validation gap.
    expect(result.amountInKobo).toBe(mockOrder.totalInKobo);
    expect(result.currency).toBe('NGN');
  });

  it('rejects a reference the gateway has never seen', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock';
    const provider = new PaystackProvider();
    await expect(provider.verifyPayment('pstk_never_initialized')).rejects.toThrow();
  });

  it('validates webhook signatures with a real HMAC-SHA512 comparison', () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock';
    const provider = new PaystackProvider();
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: 'pstk_ref_123' } });
    const validSignature = crypto.createHmac('sha512', 'sk_test_mock').update(rawBody).digest('hex');

    expect(provider.verifyWebhookSignature(rawBody, validSignature)).toBe(true);
    expect(provider.verifyWebhookSignature(rawBody, 'deadbeef')).toBe(false);
    expect(provider.verifyWebhookSignature(rawBody, undefined)).toBe(false);
  });
});

describe('FlutterwaveProvider', () => {
  it('throws PaymentProviderNotConfiguredError when credentials are missing', async () => {
    delete process.env.FLUTTERWAVE_SECRET_KEY;
    const provider = new FlutterwaveProvider();
    await expect(provider.initializePayment(mockOrder)).rejects.toBeInstanceOf(PaymentProviderNotConfiguredError);
  });

  it('initializes a real payment link against the (mocked) Flutterwave API when configured', async () => {
    process.env.FLUTTERWAVE_SECRET_KEY = 'flwsk_test_mock';
    const provider = new FlutterwaveProvider();
    const session = await provider.initializePayment(mockOrder);
    expect(session.authorizationUrl).toContain('checkout.flutterwave.com/mock');
  });
});

describe('ShowroomCollectionProvider', () => {
  it('never auto-confirms payment: verification always reports pending, requiring an admin to mark PAID', async () => {
    const provider = new ShowroomCollectionProvider();
    const result = await provider.verifyPayment('showroom_ref_1');
    expect(result.success).toBe(false);
    expect(result.status).toBe('pending');
  });

  it('has no webhook to validate and always rejects webhook signatures', () => {
    const provider = new ShowroomCollectionProvider();
    expect(provider.verifyWebhookSignature()).toBe(false);
  });
});
