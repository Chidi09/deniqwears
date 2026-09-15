import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const [orders, products, recentActivity] = await Promise.all([
    db.getOrders(),
    db.getProducts(true),
    db.getActivityLogs(),
  ]);

  // One revenue definition across the whole back-office: money collected on
  // any order that was ever paid, net of refunds. Filtering to PAID/FULFILLED
  // dropped refunded orders entirely, so a partial refund made the retained
  // portion vanish from the books rather than reducing it.
  const collectedOrders = orders.filter((o) =>
    ['PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(o.status)
  );
  const totalRevenueInKobo = collectedOrders.reduce(
    (sum, o) => sum + o.totalInKobo - (o.refundedInKobo ?? 0),
    0
  );

  // Status counts (Paid, waiting for dispatch)
  const pendingOrdersCount = orders.filter((o) => o.status === 'PAID').length;

  // Low stock variants (< 3 units)
  const lowStockAlerts: Array<{
    product: string;
    color: string;
    size: string;
    stock: number;
  }> = [];

  for (const p of products) {
    if (p.status !== 'archived') {
      for (const v of p.variants) {
        if (v.active && v.stock <= 2) {
          lowStockAlerts.push({
            product: p.name,
            color: v.color,
            size: v.size,
            stock: v.stock,
          });
        }
      }
    }
  }

  return NextResponse.json({
    totalRevenueInKobo,
    totalOrdersCount: orders.length,
    pendingFulfillmentCount: pendingOrdersCount,
    lowStockCount: lowStockAlerts.length,
    lowStockAlerts: lowStockAlerts.slice(0, 5),
    recentOrders: orders.slice(0, 5),
    recentActivity: recentActivity.slice(0, 6),
  });
}
