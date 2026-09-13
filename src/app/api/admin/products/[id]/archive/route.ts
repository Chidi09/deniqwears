import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../../auth-helper';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  const archived = db.archiveProduct(id, auth.adminEmail!);
  if (!archived) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product: archived });
}
