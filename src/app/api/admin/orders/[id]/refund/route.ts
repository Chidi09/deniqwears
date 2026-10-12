import { NextRequest, NextResponse, after } from 'next/server';
import { paymentService } from '@/server/payment/service';
import { sendRefundIssuedEmail } from '@/server/email/service';
import { PaymentGatewayError, RefundNotSettledError } from '@/server/payment/types';
import { requireAdminAuth } from '../../../auth-helper';
import { OrderRefundSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { invalidId, isValidId, parseBody } from '@/server/http';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;

  if (!isValidId(id)) return invalidId();

  // A malformed or missing body must never become "refund everything": it is
  // rejected here, and only an explicit {} means the full remaining balance.
  const parsed = await parseBody(req, OrderRefundSchema, { maxBytes: 2_000 });
  if ('response' in parsed) return parsed.response;

  try {
    // Use the amount the service actually refunded — with no amount supplied
    // it refunds the remaining balance, which is not the order total once a
    // partial refund already exists.
    const { order, refundId, refundedInKobo } = await paymentService.refundOrder(
      id,
      parsed.data.amountInKobo,
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
