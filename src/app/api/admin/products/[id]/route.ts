import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../../auth-helper';
import { ProductUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { id } = await params;
    const rawBody = await req.json();

    // Validated like POST and quick-edit. This route used to forward raw JSON
    // to the database, which accepted negative prices/stock and invalid sizes.
    const parseResult = ProductUpdateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid garment data' },
        { status: 400 }
      );
    }

    const updated = await db.updateProduct(
      id,
      parseResult.data as Parameters<typeof db.updateProduct>[1],
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
