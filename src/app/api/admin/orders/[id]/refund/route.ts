import { NextRequest, NextResponse, after } from 'next/server';
import { paymentService } from '@/server/payment/service';
import { sendRefundIssuedEmail } from '@/server/email/service';
import { PaymentGatewayError, RefundNotSettledError } from '@/server/payment/types';
import { requireAdminAuth } from '../../../auth-helper';
import { OrderRefundSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;

  // A malformed body must not become "refund everything". This previously
  // caught the parse error and substituted `{}`, which the schema accepts as
  // "no amount given" — i.e. a broken request selected the largest possible
  // financial action.
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Send {"amountInKobo": number} for a partial refund, or {} for the full remaining balance.' },
      { status: 400 }
    );
  }

  const parseResult = OrderRefundSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid refund request' },
      { status: 400 }
    );
  }

  try {
    // Use the amount the service actually refunded — with no amount supplied
    // it refunds the remaining balance, which is not the order total once a
    // partial refund already exists.
    const { order, refundId, refundedInKobo } = await paymentService.refundOrder(
      id,
      parseResult.data.amountInKobo,
      auth.adminEmail!
    );

    after(() => sendRefundIssuedEmail(order, refundedInKobo));

    return NextResponse.json({ order, refundId, refundedInKobo });
  } catch (err) {
    if (err instanceof RefundNotSettledError) {
      // 202: the gateway took it, but it isn't money-moved yet.
      return NextResponse.json({ error: err.message, refundId: err.refundId }, { status: 202 });
    }
    if (err instanceof PaymentGatewayError) {
      return NextResponse.json(
        { error: `Refund failed at the gateway: ${err.message}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: getErrorMessage(err, 'Refund failed') }, { status: 400 });
  }
}
