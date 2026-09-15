import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/server/db';
import { sendOrderDispatchedEmail } from '@/server/email/service';
import { requireAdminAuth } from '../../../auth-helper';
import { OrderStatusUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { assertAdminTransition, InvalidOrderTransitionError } from '@/server/order-state';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const rawBody = await req.json();
    const parseResult = OrderStatusUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid order status payload' },
        { status: 400 }
      );
    }

    const { status, reason } = parseResult.data;
    const previous = await db.getOrderById(id);
    if (!previous) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Enforce the state machine: no dispatching unpaid orders, and no setting
    // payment/refund states by hand.
    try {
      assertAdminTransition(previous.status, status);
    } catch (err) {
      if (err instanceof InvalidOrderTransitionError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }

    const order = await db.updateOrderStatus(id, status, reason, auth.adminEmail!);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only on the actual transition into FULFILLED, so re-saving an already
    // dispatched order doesn't email the customer twice.
    if (status === 'FULFILLED' && previous?.status !== 'FULFILLED') {
      after(() => sendOrderDispatchedEmail(order));
    }

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to update order status') },
      { status: 500 }
    );
  }
}
