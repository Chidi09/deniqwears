import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../../auth-helper';
import { OrderStatusUpdateSchema } from '@/src/lib/schemas';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(req);
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
    const order = db.updateOrderStatus(id, status, reason, auth.adminEmail!);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
