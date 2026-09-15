import { http, HttpResponse } from 'msw';

interface PaystackInitBody {
  reference: string;
  amount: number;
  currency?: string;
}

interface FlutterwaveInitBody {
  tx_ref: string;
  amount: string;
  currency: string;
}

/**
 * What a real gateway remembers between initialize and verify: the amount the
 * merchant asked to charge. Verification echoes it back, so the server's
 * amount/currency check is genuinely exercised instead of being bypassed by a
 * zero amount.
 */
const initialized = new Map<string, { amountInMinorUnit: number; currency: string }>();

/**
 * Handlers that intercept the REAL outbound HTTP calls the payment providers
 * make (server/payment/providers.ts) to Paystack and Flutterwave.
 *
 * These exist so the checkout/verify/webhook code paths can be exercised
 * end-to-end in development or tests without real gateway credentials — the
 * provider code always makes a real `fetch`, MSW just answers it with a
 * realistic canned response. Enabled via PAYMENT_MOCKING=enabled (see
 * src/mocks/server.ts / instrumentation.ts). Never active in production.
 *
 * Stripe is not intercepted here (its SDK doesn't route through global fetch
 * in a way MSW hooks reliably in Node) — test Stripe with its own test keys.
 */
export const gatewayHandlers = [
  http.post('https://api.paystack.co/transaction/initialize', async ({ request }) => {
    const body = (await request.json()) as PaystackInitBody;
    initialized.set(body.reference, {
      amountInMinorUnit: body.amount,
      currency: body.currency ?? 'NGN',
    });

    return HttpResponse.json({
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `https://checkout.paystack.com/mock/${body.reference}`,
        access_code: `mock_access_${body.reference}`,
        reference: body.reference,
      },
    });
  }),

  http.get('https://api.paystack.co/transaction/verify/:reference', ({ params }) => {
    const reference = String(params.reference);
    const record = initialized.get(reference);

    if (!record) {
      // Real Paystack 404s an unknown reference rather than confirming it.
      return HttpResponse.json(
        { status: false, message: 'Transaction reference not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      status: true,
      message: 'Verification successful',
      data: {
        id: Math.floor(Math.random() * 1_000_000),
        status: 'success',
        reference,
        amount: record.amountInMinorUnit,
        currency: record.currency,
        gateway_response: 'Approved by Financial Institution (mocked)',
        paid_at: new Date().toISOString(),
      },
    });
  }),

  http.post('https://api.paystack.co/refund', async ({ request }) => {
    const body = (await request.json()) as { transaction: string; amount?: number };
    return HttpResponse.json({
      status: true,
      message: 'Refund has been queued for processing',
      data: {
        id: Math.floor(Math.random() * 1_000_000),
        transaction: body.transaction,
        amount: body.amount ?? 0,
        status: 'processed',
        currency: 'NGN',
      },
    });
  }),

  http.post('https://api.flutterwave.com/v3/payments', async ({ request }) => {
    const body = (await request.json()) as FlutterwaveInitBody;
    initialized.set(body.tx_ref, {
      // Flutterwave takes the major unit (naira), unlike Paystack's kobo.
      amountInMinorUnit: Math.round(parseFloat(body.amount) * 100),
      currency: body.currency,
    });

    return HttpResponse.json({
      status: 'success',
      message: 'Payment link created',
      data: { link: `https://checkout.flutterwave.com/mock/${body.tx_ref}` },
    });
  }),

  http.get('https://api.flutterwave.com/v3/transactions/verify_by_reference', ({ request }) => {
    const txRef = new URL(request.url).searchParams.get('tx_ref') ?? '';
    const record = initialized.get(txRef);

    if (!record) {
      return HttpResponse.json({ status: 'error', message: 'No transaction found' }, { status: 404 });
    }

    return HttpResponse.json({
      status: 'success',
      data: {
        id: Math.floor(Math.random() * 1_000_000),
        tx_ref: txRef,
        status: 'successful',
        amount: record.amountInMinorUnit / 100,
        currency: record.currency,
        processor_response: 'Approved (mocked)',
        created_at: new Date().toISOString(),
      },
    });
  }),
];
