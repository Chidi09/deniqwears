import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = db.getProductBySlug(slug);
  if (!product || product.status === 'archived') {
    return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
  }
  return NextResponse.json({ product });
}
