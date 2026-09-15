import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { ProductCreateUpdateSchema } from '@/src/lib/schemas';
import { getErrorMessage } from '@/src/lib/errors';

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
    const rawBody = await req.json();
    const parseResult = ProductCreateUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid garment data' },
        { status: 400 }
      );
    }

    // Prisma requires secondaryImage; fall back to the primary rather than
    // letting a schema-valid payload fail at insert.
    const payload = {
      ...parseResult.data,
      secondaryImage: parseResult.data.secondaryImage || parseResult.data.primaryImage,
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
