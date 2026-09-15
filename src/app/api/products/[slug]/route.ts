import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  // Only live products are public. This previously excluded archived products
  // alone, so unpublished drafts — pricing, imagery and all — were readable by
  // anyone who guessed or was told the slug, while the list endpoint correctly
  // hid them.
  if (!product || product.status !== 'live') {
    return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
