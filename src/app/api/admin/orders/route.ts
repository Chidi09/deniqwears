import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';

export async function GET(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const orders = db.getOrders();
  return NextResponse.json({ orders });
}
