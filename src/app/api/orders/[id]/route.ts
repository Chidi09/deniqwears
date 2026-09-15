import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../admin/auth-helper';

/**
 * Admin-only. This previously required no authentication, and `getOrderById`
 * also matches the public order number (DNQ-#####) — a ~90k keyspace — so the
 * full order, including the customer's name, email, phone, address, payment
 * reference and idempotency key, could be enumerated by anyone.
 *
 * There is no customer authentication in this application, and nothing in the
 * storefront calls this route, so it is locked to admins. Guest order tracking
 * needs a cryptographically scoped token issued at checkout — build that
 * deliberately rather than reopening this route.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const order = await db.getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ order });
}
