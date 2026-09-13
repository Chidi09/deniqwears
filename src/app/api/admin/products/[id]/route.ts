import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = db.updateProduct(id, body, auth.adminEmail!);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update garment' },
      { status: 500 }
    );
  }
}
