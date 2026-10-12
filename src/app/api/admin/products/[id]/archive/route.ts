import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../../auth-helper';
import { invalidId, isValidId } from '@/server/http';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const { id } = await params;
  if (!isValidId(id)) return invalidId();
  const archived = await db.archiveProduct(id, auth.adminEmail!);
  if (!archived) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product: archived });
}
