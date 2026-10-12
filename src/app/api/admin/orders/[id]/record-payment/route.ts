import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/server/payment/service';
import { PaymentVerificationError } from '@/server/payment/types';
import { InsufficientStockError } from '@/server/db';
import { requireAdminAuth } from '../../../auth-helper';
import { getErrorMessage } from '@/src/lib/errors';
import { RecordPaymentSchema } from '@/src/lib/schemas';
import { invalidId, isValidId, parseBody } from '@/server/http';

/**
 * Records payment collected in person for a showroom order. Showroom orders
 * are never auto-confirmed (nothing to verify against a gateway), and admins
 * can no longer set PAID directly through the status endpoint — this is the
 * deliberate path, and it stores a payment id so the order stays refundable.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;

  if (!isValidId(id)) return invalidId();

  const parsed = await parseBody(req, RecordPaymentSchema, { maxBytes: 2_000 });
  if ('response' in parsed) return parsed.response;

  try {
    const { order } = await paymentService.recordManualPayment(
      id,
      auth.adminEmail!,
      parsed.data.note
    );
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: 'Stock ran out for one of these garments. Adjust inventory before recording payment.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: getErrorMessage(err, 'Could not record payment') }, { status: 400 });
  }
}
