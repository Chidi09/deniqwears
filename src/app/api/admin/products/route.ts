import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { requireAdminAuth } from '../auth-helper';
import { ProductCreateUpdateSchema } from '@/src/lib/schemas';

export async function GET(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (!auth.authorized) return auth.response!;

  const products = db.getProducts(true);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const auth = requireAdminAuth(req);
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

    const newProduct = db.createProduct(parseResult.data as any, auth.adminEmail!);
    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create garment' },
      { status: 500 }
    );
  }
}
