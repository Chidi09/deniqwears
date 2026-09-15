import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/payment/service';
import { PaymentVerificationError, PaymentGatewayError } from '@/server/payment/types';
import { InsufficientStockError } from '@/server/db';
import { PaymentVerifySchema } from '@/src/lib/schemas';

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parseResult = PaymentVerifySchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Reference and order ID are required' },
      { status: 400 }
    );
  }

  const { reference, orderId } = parseResult.data;

  try {
    const result = await paymentService.verifyPayment(reference, orderId);
    return NextResponse.json(result);
  } catch (err) {
    // Expected, explainable failures get their own message. Everything else is
    // logged server-side and answered generically, so Prisma/config internals
    // (model names, query text, connection strings) never reach a customer.
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (err instanceof InsufficientStockError) {
      console.error('Stock shortage confirming payment:', err);
      return NextResponse.json(
        {
          error:
            'Your payment went through, but one of these pieces sold out while you were checking out. Our concierge will contact you right away to arrange a replacement or refund.',
        },
        { status: 409 }
      );
    }

    if (err instanceof PaymentGatewayError) {
      console.error('Gateway error during verification:', err);
      return NextResponse.json(
        { error: 'We could not reach the payment provider. Please try again in a moment.' },
        { status: 502 }
      );
    }

    console.error('Payment verification failed:', err);
    return NextResponse.json(
      { error: 'We could not verify this payment. Please contact the concierge with your order number.' },
      { status: 400 }
    );
  }
}
