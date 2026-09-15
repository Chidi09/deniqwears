import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paymentService } from '@/server/payment/service';
import { PaymentVerificationError } from '@/server/payment/types';
import { InsufficientStockError } from '@/server/db';
import { requireAdminAuth } from '../../../auth-helper';
import { getErrorMessage } from '@/src/lib/errors';

const RecordPaymentSchema = z.object({
  note: z.string().trim().max(300).optional(),
});

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

  let rawBody: unknown = {};
  try {
    rawBody = await req.json();
  } catch {
    rawBody = {};
  }

  const parseResult = RecordPaymentSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    );
  }

  try {
    const { order } = await paymentService.recordManualPayment(
      id,
      auth.adminEmail!,
      parseResult.data.note
    );
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof PaymentVerificationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: 'Stock ran out for one of these garments — adjust inventory before recording payment.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: getErrorMessage(err, 'Could not record payment') }, { status: 400 });
  }
}
