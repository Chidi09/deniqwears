import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';
import { ProductUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { invalidId, isValidId, parseBody } from '@/server/http';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    if (!isValidId(id)) return invalidId();
    const parsed = await parseBody(req, ProductUpdateSchema, { maxBytes: 300000 });
    if ('response' in parsed) return parsed.response;

    const updated = await db.updateProduct(
      id,
      parsed.data as Parameters<typeof db.updateProduct>[1],
      auth.adminEmail!
    );
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to update garment') },
      { status: 500 }
    );
  }
}
