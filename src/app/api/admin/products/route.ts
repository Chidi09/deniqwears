import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { ProductCreateUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';
import { parseBody } from '@/server/http';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const products = await db.getProducts(true);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const parsed = await parseBody(req, ProductCreateUpdateSchema, { maxBytes: 300000 });
    if ('response' in parsed) return parsed.response;

    // Prisma requires secondaryImage; fall back to the primary rather than
    // letting a schema-valid payload fail at insert.
    const payload = {
      ...parsed.data,
      secondaryImage: parsed.data.secondaryImage || parsed.data.primaryImage,
    };

    const newProduct = await db.createProduct(
      payload as Parameters<typeof db.createProduct>[0],
      auth.adminEmail!
    );
    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to create garment') },
      { status: 500 }
    );
  }
}
