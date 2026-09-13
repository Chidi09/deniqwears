import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';

export async function GET(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const orders = db.getOrders();
  const products = db.getProducts(true);

  // Total paid revenue in kobo
  const paidOrders = orders.filter(
    (o) => o.status === 'PAID' || o.status === 'FULFILLED'
  );
  const totalRevenueInKobo = paidOrders.reduce((sum, o) => sum + o.totalInKobo, 0);

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
    recentActivity: db.getActivityLogs().slice(0, 6),
  });
}
